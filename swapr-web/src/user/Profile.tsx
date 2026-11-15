import { FormEvent, useMemo, useState } from 'react';
import type { AuthUser } from './Products';
import defaultProfilePhoto from './assets/images/user-default.webp';

const API_BASE_URL = process.env.REACT_APP_API_URL ?? 'http://localhost:4000';
const requiredProfileFields: (keyof AuthUser)[] = ['firstname', 'middlename', 'lname', 'email', 'age', 'gender', 'birthdate', 'placeOfBirth'];

const isProfileComplete = (user: AuthUser | null) => {
  if (!user) {
    return false;
  }

  return requiredProfileFields.every((field) => {
    const value = user[field];

    if (typeof value === 'number') {
      return value > 0;
    }

    return typeof value === 'string' ? value.trim().length > 0 : Boolean(value);
  });
};

const formatDateForInput = (value?: string | null) => {
  if (!value) {
    return '';
  }

  return value.slice(0, 10);
};

const formatDisplayDate = (value?: string | null) => {
  if (!value) {
    return 'Not set';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value));
};

interface ProfileProps {
  user: AuthUser | null;
  onUserUpdate: (user: AuthUser) => void;
}

function Profile({ user, onUserUpdate }: ProfileProps) {
  const [profileOffcanvasOpen, setProfileOffcanvasOpen] = useState(false);
  const [profileOffcanvasClosing, setProfileOffcanvasClosing] = useState(false);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState('');
  const [saveMessage, setSaveMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const profileOffcanvasVisible = profileOffcanvasOpen || profileOffcanvasClosing;
  const profileComplete = isProfileComplete(user);
  const displayName = [user?.firstname, user?.middlename, user?.lname].filter(Boolean).join(' ') || 'No information yet';
  const profileHandle = user?.email ? `@${user.email.split('@')[0]}` : '@swapr';
  const profileDescription = 'Local seller focused on quality preloved items and safe public meetups.';
  const profileFields = useMemo(
    () => [
      ['First name', user?.firstname || 'Not set'],
      ['Middle name', user?.middlename || 'Not set'],
      ['Last name', user?.lname || 'Not set'],
      ['Email', user?.email || 'Not set'],
      ['Age', user?.age ? String(user.age) : 'Not set'],
      ['Gender', user?.gender || 'Not set'],
      ['Birthday', formatDisplayDate(user?.birthdate)],
      ['Place of birth', user?.placeOfBirth || 'Not set'],
      ['Created at', formatDisplayDate(user?.created_at)],
      ['Updated at', formatDisplayDate(user?.updated_at)],
    ],
    [user],
  );

  const openProfileOffcanvas = () => {
    setProfileOffcanvasClosing(false);
    setProfileOffcanvasOpen(true);
  };

  const closeProfileOffcanvas = () => {
    if (user?.newUser) {
      return;
    }

    setProfileOffcanvasClosing(true);
    setProfileOffcanvasOpen(false);
    window.setTimeout(() => {
      setProfileOffcanvasClosing(false);
      setProfilePhotoPreview('');
    }, 260);
  };

  const saveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!user) {
      return;
    }

    setSaving(true);
    setSaveMessage('');

    const formData = new FormData(event.currentTarget);
    const payload = {
      firstname: String(formData.get('firstname') ?? '').trim(),
      middlename: String(formData.get('middlename') ?? '').trim(),
      lname: String(formData.get('lname') ?? '').trim(),
      age: Number(formData.get('age')),
      gender: String(formData.get('gender') ?? ''),
      birthdate: String(formData.get('birthdate') ?? ''),
      placeOfBirth: String(formData.get('placeOfBirth') ?? '').trim(),
      newUser: false,
    };

    try {
      const response = await fetch(`${API_BASE_URL}/profile/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message ?? 'Failed to save profile');
      }

      onUserUpdate(data.user as AuthUser);
      setSaveMessage('Profile saved. You can now use the rest of Swapr.');
      setProfileOffcanvasClosing(true);
      setProfileOffcanvasOpen(false);
      window.setTimeout(() => {
        setProfileOffcanvasClosing(false);
        setProfilePhotoPreview('');
      }, 260);
    } catch (error) {
      setSaveMessage(error instanceof Error ? error.message : 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <section className={`profile-hero ${profileComplete ? '' : 'profile-hero-empty'}`}>
        <div className="profile-identity">
          <img src={defaultProfilePhoto} alt="" className="avatar avatar-lg rounded-circle" />
          <div>
            <span>Account profile</span>
            <h1>{displayName}</h1>
            <p>{profileHandle}</p>
          </div>
        </div>
        <button className="shop-add-button" type="button" onClick={openProfileOffcanvas}>
          <i className="ti ti-pencil" />
          {profileComplete ? 'Edit profile' : 'Set up profile'}
        </button>
      </section>

      {profileComplete ? (
        <section className="profile-panel">
          <div className="shop-panel-heading">
            <div>
              <h2>Profile Information</h2>
              <p>Public and account details connected to your Swapr profile.</p>
            </div>
            <span>Verified</span>
          </div>

          <div className="profile-info-grid">
            {profileFields.map(([label, value]) => (
              <div className="profile-info-item" key={label}>
                <span>{label}</span>
                <strong>{value}</strong>
              </div>
            ))}
          </div>

          <div className="profile-description">
            <span>Profile description</span>
            <p>{profileDescription}</p>
          </div>
        </section>
      ) : (
        <section className="profile-empty-card">
          <div className="profile-empty-icon" aria-hidden="true">
            <i className="ti ti-user-question" />
          </div>
          <div>
            <span>Profile setup</span>
            <h2>No information yet</h2>
            <p>
              Add your personal details first so your Swapr account can be trusted for chat-based listings and public meetups.
            </p>
          </div>
        </section>
      )}

      {profileOffcanvasVisible && (
        <>
          <div
            className={`shop-offcanvas-backdrop ${profileOffcanvasClosing ? 'closing' : ''}`}
            onClick={closeProfileOffcanvas}
          />
          <aside className={`shop-offcanvas ${profileOffcanvasClosing ? 'closing' : ''}`} aria-label="Edit profile form">
            <div className="shop-offcanvas-header">
              <div>
                <h2>Edit profile</h2>
                <p>Update your profile details and public account photo.</p>
              </div>
              {!user?.newUser && (
                <button type="button" aria-label="Close edit profile form" onClick={closeProfileOffcanvas}>
                  <i className="ti ti-x" />
                </button>
              )}
            </div>

            <form className="shop-product-form" onSubmit={saveProfile}>
              <div className="shop-product-tip">
                <i className="ti ti-shield-check" />
                <div>
                  <strong>Profile tip</strong>
                  <span>Keep your name, contact details, and bio accurate so buyers can trust your listings.</span>
                </div>
              </div>

              <label className="shop-photo-field">
                Profile photo
                <span className="shop-photo-preview profile-photo-preview">
                  {profilePhotoPreview ? (
                    <img src={profilePhotoPreview} alt="Selected profile preview" />
                  ) : (
                    <img src={defaultProfilePhoto} alt="" />
                  )}
                  <span className="shop-photo-action">
                    <i className="ti ti-camera-plus" />
                    Change photo
                  </span>
                </span>
                <input
                  className="form-control"
                  type="file"
                  accept="image/*"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    setProfilePhotoPreview(file ? URL.createObjectURL(file) : '');
                  }}
                />
              </label>

              <div className="shop-form-grid">
                <label>
                  First name
                  <input className="form-control" name="firstname" placeholder="Enter first name" defaultValue={user?.firstname ?? ''} required />
                </label>
                <label>
                  Middle name
                  <input className="form-control" name="middlename" placeholder="Enter middle name" defaultValue={user?.middlename ?? ''} required />
                </label>
              </div>
              <label>
                Last name
                <input className="form-control" name="lname" placeholder="Enter last name" defaultValue={user?.lname ?? ''} required />
              </label>
              <label>
                Email
                <input className="form-control" type="email" value={user?.email ?? ''} readOnly />
              </label>
              <div className="shop-form-grid">
                <label>
                  Age
                  <input className="form-control" name="age" type="number" min="1" placeholder="Enter age" defaultValue={user?.age ?? ''} required />
                </label>
                <label>
                  Gender
                  <select className="form-select" name="gender" defaultValue={user?.gender ?? ''} required>
                    <option value="" disabled>Select gender</option>
                    <option>Female</option>
                    <option>Male</option>
                    <option>Non-binary</option>
                    <option>Prefer not to say</option>
                  </select>
                </label>
              </div>
              <label>
                Birthday
                <input className="form-control" name="birthdate" type="date" defaultValue={formatDateForInput(user?.birthdate)} required />
              </label>
              <label>
                Place of birth
                <input className="form-control" name="placeOfBirth" placeholder="City, province, or country" defaultValue={user?.placeOfBirth ?? ''} required />
              </label>
              <label>
                Profile description
                <textarea className="form-control" rows={4} placeholder="Share a short note about your Swapr profile" defaultValue={profileDescription} />
              </label>
              {saveMessage && <p className="auth-note">{saveMessage}</p>}
              <button className="shop-submit-button" type="submit" disabled={saving}>
                {saving ? 'Saving...' : 'Save profile'}
              </button>
            </form>
          </aside>
        </>
      )}
    </>
  );
}

export default Profile;
