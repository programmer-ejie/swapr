import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { z } from 'zod';
import type { SessionRequest } from './auth.service.js';
import { SessionGuard } from './session.guard.js';
import { MarketplaceService } from './marketplace.service.js';
import {
  email,
  listing,
  meetup,
  parse,
  profile,
  shop,
  uuid,
} from './validation.js';

@Controller()
export class MarketplaceController {
  constructor(private readonly market: MarketplaceService) {}
  @Get('categories') async categories() {
    return { categories: await this.market.categories() };
  }
  @Get('listings') async listings(
    @Query('q') q = '',
    @Query('category') category = '',
  ) {
    return { listings: await this.market.listings(q, category) };
  }
  @Post('newsletter') subscribe(@Body() body: unknown) {
    return this.market.subscribe(
      parse(z.object({ email }).strict(), body).email,
    );
  }

  @Patch('profile/:id')
  @UseGuards(SessionGuard)
  profile(
    @Req() req: SessionRequest,
    @Param('id') id: string,
    @Body() body: unknown,
  ) {
    if (parse(uuid, id) !== req.userId) throw new ForbiddenException();
    return this.market.updateProfile(req.userId, parse(profile, body));
  }
  @Get('shop') @UseGuards(SessionGuard) shop(@Req() req: SessionRequest) {
    return this.market.myShop(req.userId);
  }
  @Put('shop') @UseGuards(SessionGuard) saveShop(
    @Req() req: SessionRequest,
    @Body() body: unknown,
  ) {
    return this.market.saveShop(req.userId, parse(shop, body));
  }
  @Get('shop/listings') @UseGuards(SessionGuard) async myListings(
    @Req() req: SessionRequest,
  ) {
    return { listings: await this.market.listings('', '', req.userId) };
  }
  @Post('listings') @UseGuards(SessionGuard) createListing(
    @Req() req: SessionRequest,
    @Body() body: unknown,
  ) {
    return this.market.saveListing(req.userId, parse(listing, body));
  }
  @Patch('listings/:id') @UseGuards(SessionGuard) updateListing(
    @Req() req: SessionRequest,
    @Param('id') id: string,
    @Body() body: unknown,
  ) {
    return this.market.saveListing(
      req.userId,
      parse(listing, body),
      parse(uuid, id),
    );
  }
  @Delete('listings/:id') @UseGuards(SessionGuard) archiveListing(
    @Req() req: SessionRequest,
    @Param('id') id: string,
  ) {
    return this.market.archiveListing(req.userId, parse(uuid, id));
  }
  @Get('favorites') @UseGuards(SessionGuard) async favorites(
    @Req() req: SessionRequest,
  ) {
    return { favorites: await this.market.favorites(req.userId) };
  }
  @Put('favorites/:id') @UseGuards(SessionGuard) favorite(
    @Req() req: SessionRequest,
    @Param('id') id: string,
  ) {
    return this.market.saveFavorite(req.userId, parse(uuid, id));
  }
  @Delete('favorites/:id') @UseGuards(SessionGuard) unfavorite(
    @Req() req: SessionRequest,
    @Param('id') id: string,
  ) {
    return this.market.removeFavorite(req.userId, parse(uuid, id));
  }
  @Get('conversations') @UseGuards(SessionGuard) async conversations(
    @Req() req: SessionRequest,
  ) {
    return { conversations: await this.market.conversations(req.userId) };
  }
  @Post('conversations') @UseGuards(SessionGuard) startConversation(
    @Req() req: SessionRequest,
    @Body() body: unknown,
  ) {
    return this.market.startConversation(
      req.userId,
      parse(z.object({ listingId: uuid }).strict(), body).listingId,
    );
  }
  @Get('conversations/:id/messages') @UseGuards(SessionGuard) messages(
    @Req() req: SessionRequest,
    @Param('id') id: string,
  ) {
    return this.market.messages(req.userId, parse(uuid, id));
  }
  @Post('conversations/:id/messages') @UseGuards(SessionGuard) sendMessage(
    @Req() req: SessionRequest,
    @Param('id') id: string,
    @Body() body: unknown,
  ) {
    return this.market.sendMessage(
      req.userId,
      parse(uuid, id),
      parse(
        z.object({ body: z.string().trim().min(1).max(4000) }).strict(),
        body,
      ).body,
    );
  }
  @Post('conversations/:id/meetups') @UseGuards(SessionGuard) meetup(
    @Req() req: SessionRequest,
    @Param('id') id: string,
    @Body() body: unknown,
  ) {
    return this.market.proposeMeetup(
      req.userId,
      parse(uuid, id),
      parse(meetup, body),
    );
  }
  @Patch('meetups/:id') @UseGuards(SessionGuard) updateMeetup(
    @Req() req: SessionRequest,
    @Param('id') id: string,
    @Body() body: unknown,
  ) {
    return this.market.changeMeetup(
      req.userId,
      parse(uuid, id),
      parse(
        z
          .object({ status: z.enum(['confirmed', 'completed', 'cancelled']) })
          .strict(),
        body,
      ).status,
    );
  }
  @Get('notifications') @UseGuards(SessionGuard) async notifications(
    @Req() req: SessionRequest,
  ) {
    return { notifications: await this.market.notifications(req.userId) };
  }
  @Patch('notifications/read') @UseGuards(SessionGuard) readNotifications(
    @Req() req: SessionRequest,
  ) {
    return this.market.readNotifications(req.userId);
  }
  @Get('analytics') @UseGuards(SessionGuard) analytics(
    @Req() req: SessionRequest,
  ) {
    return this.market.analytics(req.userId);
  }
}
