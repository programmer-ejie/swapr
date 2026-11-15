import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import {
  createHash,
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
} from 'node:crypto';
import { promisify } from 'node:util';
import type { Request, Response } from 'express';
import { DatabaseService } from './database/database.service.js';

const scrypt = promisify(scryptCallback);
const sessionDays = 7;
const hashToken = (token: string) =>
  createHash('sha256').update(token).digest('hex');
export const userFields = `id,email,firstname,middlename,lname,age,gender,
  to_char(birthdate,'YYYY-MM-DD') as birthdate,place_of_birth as "placeOfBirth",
  profile_pic_url as "profilePicUrl",description,new_user as "newUser",created_at,updated_at`;
export type SessionRequest = Request & { userId: string };

@Injectable()
export class AuthService {
  constructor(private readonly db: DatabaseService) {}

  async register(email: string, password: string) {
    const salt = randomBytes(16).toString('hex');
    const hash = (await scrypt(password, salt, 64)) as Buffer;
    try {
      await this.db.transaction(async (client) => {
        const { rows } = await client.query(
          'insert into swapr.users(email,password_hash) values($1,$2) returning id',
          [email, `${salt}:${hash.toString('hex')}`],
        );
        await client.query('insert into swapr.shops(user_id) values($1)', [
          rows[0].id,
        ]);
        await client.query(
          "insert into swapr.notifications(user_id,title,text,type) values($1,'Welcome to Swapr','Complete your profile, then publish your first listing.','Account')",
          [rows[0].id],
        );
      });
    } catch (error) {
      if ((error as { code?: string }).code === '23505')
        throw new ConflictException('This email is already registered.');
      throw error;
    }
    return {
      message:
        'Account created. You can now log in with your email and password.',
    };
  }

  async login(email: string, password: string, response: Response) {
    const [user] = await this.db.query(
      'select id,password_hash from swapr.users where email=$1',
      [email],
    );
    // Perform the same expensive operation when the email does not exist.
    const [salt, stored] = user
      ? String(user.password_hash).split(':')
      : ['0'.repeat(32), '0'.repeat(128)];
    const hash = (await scrypt(password, salt, 64)) as Buffer;
    if (!user || !timingSafeEqual(hash, Buffer.from(stored, 'hex')))
      throw new UnauthorizedException('Incorrect email or password.');
    const token = randomBytes(32).toString('hex');
    await this.db.query('delete from swapr.sessions where expires_at < now()');
    await this.db.query(
      "insert into swapr.sessions(token_hash,user_id,expires_at) values($1,$2,now() + interval '7 days')",
      [hashToken(token), user.id],
    );
    response.cookie('swapr_session', token, {
      ...this.cookieOptions(),
      maxAge: sessionDays * 86400000,
    });
    return { user: await this.user(user.id as string) };
  }

  async authenticate(request: Request): Promise<string> {
    const token = this.token(request);
    if (!/^[a-f0-9]{64}$/.test(token))
      throw new UnauthorizedException('Please log in.');
    const [session] = await this.db.query(
      'select user_id from swapr.sessions where token_hash=$1 and expires_at > now()',
      [hashToken(token)],
    );
    if (!session)
      throw new UnauthorizedException(
        'Your session has expired. Please log in.',
      );
    return session.user_id as string;
  }

  async user(id: string) {
    const [user] = await this.db.query(
      `select ${userFields} from swapr.users where id=$1`,
      [id],
    );
    if (!user) throw new UnauthorizedException();
    return user;
  }

  async logout(request: Request, response: Response) {
    await this.db.query('delete from swapr.sessions where token_hash=$1', [
      hashToken(this.token(request)),
    ]);
    response.clearCookie('swapr_session', this.cookieOptions());
    return { message: 'Logged out.' };
  }

  private token(request: Request) {
    return (
      request.headers.cookie
        ?.split(';')
        .map((s) => s.trim())
        .find((s) => s.startsWith('swapr_session='))
        ?.slice('swapr_session='.length) ?? ''
    );
  }
  private cookieOptions() {
    return {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
    };
  }
}
