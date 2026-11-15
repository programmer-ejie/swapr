import { useState } from 'react';
import avatar1 from './assets/images/avatar/avatar-1.webp';
import avatar2 from './assets/images/avatar/avatar-2.webp';
import avatar3 from './assets/images/avatar/avatar-3.webp';
import avatar4 from './assets/images/avatar/avatar-4.webp';
import avatar5 from './assets/images/avatar/avatar-5.webp';
import avatar6 from './assets/images/avatar/avatar-6.webp';

type RoleFilter = 'seller' | 'buyer';

const messages = [
  {
    name: 'Mika Reyes',
    avatar: avatar3,
    role: 'seller',
    product: 'Desk Lamp',
    preview: 'Is the desk lamp still available?',
    time: '5 min',
    status: 'Online',
    unread: 2,
    conversation: [
      ['buyer', 'Is the desk lamp still available?'],
      ['seller', 'Yes, it is still available. It is in good condition and ready for meetup.'],
      ['buyer', 'Great. Can we meet tomorrow afternoon?'],
    ],
  },
  {
    name: 'Jon Cruz',
    avatar: avatar4,
    role: 'seller',
    product: 'Gaming Joy Stick',
    preview: 'Can we meet near the mall entrance?',
    time: '24 min',
    status: 'Meetup',
    unread: 0,
    conversation: [
      ['buyer', 'Can we meet near the mall entrance?'],
      ['seller', 'Yes, the mall entrance works for me. I can bring the joystick in its box.'],
      ['buyer', 'Nice. Is it tested on PC?'],
      ['seller', 'Yes, I tested it yesterday and all buttons are working.'],
    ],
  },
  {
    name: 'Ana Santos',
    avatar: avatar2,
    role: 'seller',
    product: 'Denim Jacket',
    preview: 'Does the jacket have any stains?',
    time: '1 hour',
    status: 'Buyer',
    unread: 0,
    conversation: [
      ['buyer', 'Does the jacket have any stains?'],
      ['seller', 'No visible stains. There is light fading near the sleeves because it is preloved.'],
      ['buyer', 'Can you send one close-up photo before meetup?'],
      ['seller', 'Sure, I can send that before we confirm the location.'],
    ],
  },
  {
    name: 'Rafael Dizon',
    avatar: avatar1,
    role: 'seller',
    product: 'Study Chair',
    preview: 'Can you reserve the chair until tonight?',
    time: '3 hours',
    status: 'Buyer',
    unread: 1,
    conversation: [
      ['buyer', 'Can you reserve the chair until tonight?'],
      ['seller', 'Yes, I can reserve it until 8 PM. The chair is still sturdy.'],
      ['buyer', 'Does it fit inside a sedan?'],
      ['seller', 'It should fit if the back seat is folded. I can measure it for you.'],
    ],
  },
  {
    name: 'Bea Navarro',
    avatar: avatar5,
    role: 'seller',
    product: 'Vintage Tote Bag',
    preview: 'Is the zipper still smooth?',
    time: '4 hours',
    status: 'Online',
    unread: 0,
    conversation: [
      ['buyer', 'Is the zipper still smooth?'],
      ['seller', 'Yes, the zipper opens and closes smoothly. The bag has light marks inside.'],
      ['buyer', 'Can we meet near the train station?'],
      ['seller', 'That works. I prefer the main entrance where there is security.'],
    ],
  },
  {
    name: 'Mark Villanueva',
    avatar: avatar6,
    role: 'seller',
    product: 'Wireless Headphones',
    preview: 'Can I check both sides before paying?',
    time: '6 hours',
    status: 'Meetup',
    unread: 0,
    conversation: [
      ['buyer', 'Can I check both sides before paying?'],
      ['seller', 'Of course. You can test the left and right speakers during meetup.'],
      ['buyer', 'Is there any issue with the battery?'],
      ['seller', 'Battery still lasts around 4 hours. I will charge it before we meet.'],
    ],
  },
  {
    name: 'Carlo Lim',
    avatar: avatar1,
    role: 'buyer',
    product: 'Bluetooth Speaker',
    preview: 'How long does the battery last? Can I test it?',
    time: '2 hours',
    status: 'Online',
    unread: 1,
    conversation: [
      ['buyer', 'How long does the battery last? Can I test it?'],
      ['seller', 'It lasts around 5 hours at medium volume. You can test it during meetup.'],
      ['buyer', 'Perfect. Does it include the charging cable?'],
      ['seller', 'Yes, I will include the original cable.'],
    ],
  },
  {
    name: 'Leah Tan',
    avatar: avatar5,
    role: 'buyer',
    product: 'Compact Camera',
    preview: 'Are there scratches on the lens?',
    time: 'Yesterday',
    status: 'Buyer',
    unread: 0,
    conversation: [
      ['buyer', 'Are there scratches on the lens?'],
      ['seller', 'The lens is clear. The body has a few small marks from normal use.'],
      ['buyer', 'Can we meet somewhere with good lighting so I can check it?'],
      ['seller', 'Yes, a cafe or mall lobby would be good for inspection.'],
    ],
  },
  {
    name: 'Nico Ramos',
    avatar: avatar6,
    role: 'buyer',
    product: 'USB Microphone',
    preview: 'Is the mic compatible with Windows laptop?',
    time: '2 days',
    status: 'Meetup',
    unread: 0,
    conversation: [
      ['buyer', 'Is the mic compatible with Windows laptop?'],
      ['seller', 'Yes, it is plug-and-play on Windows. I used it for online classes.'],
      ['buyer', 'Any issue with background noise?'],
      ['seller', 'It works best in a quiet room, but the sound is clear for calls and recordings.'],
    ],
  },
  {
    name: 'Sofia Garcia',
    avatar: avatar3,
    role: 'buyer',
    product: 'Room Shelf Decor',
    preview: 'I can give the set for PHP 260 if you meet today.',
    time: '3 days',
    status: 'Seller',
    unread: 2,
    conversation: [
      ['buyer', 'Is the room shelf decor set still available?'],
      ['seller', 'Yes, it is available. I can give the set for PHP 260 if you meet today.'],
      ['buyer', 'That sounds good. Where is your preferred meetup spot?'],
      ['seller', 'Near the bookstore entrance would be easiest and public.'],
    ],
  },
  {
    name: 'Paolo Mendoza',
    avatar: avatar4,
    role: 'buyer',
    product: 'Preloved Denim Jacket',
    preview: 'I washed it already and can bring it tomorrow.',
    time: '4 days',
    status: 'Seller',
    unread: 0,
    conversation: [
      ['buyer', 'Is the denim jacket medium size?'],
      ['seller', 'Yes, it fits medium. I washed it already and can bring it tomorrow.'],
      ['buyer', 'Can I inspect the sleeves before paying?'],
      ['seller', 'Yes, please inspect it first so you are comfortable with the condition.'],
    ],
  },
  {
    name: 'Iris Chua',
    avatar: avatar2,
    role: 'buyer',
    product: 'Warm Desk Lamp',
    preview: 'The bulb is included and the switch is working.',
    time: 'Last week',
    status: 'Seller',
    unread: 0,
    conversation: [
      ['buyer', 'Does the warm desk lamp include the bulb?'],
      ['seller', 'Yes, the bulb is included and the switch is working.'],
      ['buyer', 'Can we meet after office hours?'],
      ['seller', 'Yes, 6:30 PM near the lobby is okay for me.'],
    ],
  },
];

function Messages() {
  const [activeRole, setActiveRole] = useState<RoleFilter>('seller');
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [activeConversationName, setActiveConversationName] = useState(messages[0].name);
  const [mobileChatOpen, setMobileChatOpen] = useState(false);
  const visibleMessages = messages.filter((message) => message.role === activeRole);
  const activeConversation =
    visibleMessages.find((message) => message.name === activeConversationName) ?? visibleMessages[0];

  const selectRole = (role: RoleFilter) => {
    const firstConversation = messages.find((message) => message.role === role);

    setActiveRole(role);
    setRoleMenuOpen(false);
    setMobileChatOpen(false);

    if (firstConversation) {
      setActiveConversationName(firstConversation.name);
    }
  };

  return (
    <div className="messages-workspace">
      <section className={`messenger-shell ${mobileChatOpen ? 'chat-open' : ''}`}>
        <aside className="messenger-list" aria-label={`${activeRole === 'seller' ? 'Seller' : 'Buyer'} conversations`}>
          <div className="messenger-list-header">
            <div>
              <h2>Conversations</h2>
              <p>{activeRole === 'seller' ? 'Recent buyer activity' : 'Messages from sellers'}</p>
            </div>
            <div className="messenger-role-filter">
              <button
                type="button"
                aria-label="Choose conversation role"
                aria-expanded={roleMenuOpen}
                onClick={() => setRoleMenuOpen((current) => !current)}
              >
                <i className="ti ti-adjustments-horizontal" />
              </button>
              {roleMenuOpen && (
                <div className="messenger-role-menu">
                  {[
                    ['seller', 'I am the seller', 'Buyer messages'],
                    ['buyer', 'I am the buyer', 'Seller messages'],
                  ].map(([role, label, description]) => (
                    <button
                      className={activeRole === role ? 'active' : ''}
                      type="button"
                      key={role}
                      onClick={() => selectRole(role as RoleFilter)}
                    >
                      <span>{label}</span>
                      <small>{description}</small>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="messenger-search">
            <i className="ti ti-search" />
            <input type="search" placeholder="Search conversations..." />
          </div>

          <div className="messenger-thread-list">
            {visibleMessages.map((message) => (
              <button
                className={`messenger-thread ${message.name === activeConversation.name ? 'active' : ''}`}
                type="button"
                key={message.name}
                onClick={() => {
                  setActiveConversationName(message.name);
                  setMobileChatOpen(true);
                }}
              >
                <span className="messenger-avatar">
                  <img src={message.avatar} alt="" />
                  <i />
                </span>
                <span className="messenger-thread-copy">
                  <span>
                    <strong>{message.name}</strong>
                    <small>{message.time}</small>
                  </span>
                  <em>{message.product}</em>
                  <p>{message.preview}</p>
                </span>
                {message.unread > 0 && <b>{message.unread}</b>}
              </button>
            ))}
          </div>
        </aside>

        <section className="messenger-chat" aria-label={`Conversation with ${activeConversation.name}`}>
          <div className="messenger-chat-header">
            <button
              className="messenger-mobile-back"
              type="button"
              aria-label="Back to conversations"
              onClick={() => setMobileChatOpen(false)}
            >
              <i className="ti ti-arrow-left" />
            </button>
            <div className="messenger-chat-person">
              <span className="messenger-avatar large">
                <img src={activeConversation.avatar} alt="" />
                <i />
              </span>
              <div>
                <h2>{activeConversation.name}</h2>
                <p>
                  <span>{activeConversation.status}</span>
                  Asking about {activeConversation.product}
                </p>
              </div>
            </div>
            <button type="button">
              <i className="ti ti-calendar-plus" />
              Set meetup
            </button>
          </div>

          <div className="messenger-chat-body">
            {activeConversation.conversation.map(([sender, text]) => (
              <div className={`message-bubble ${sender}`} key={text}>
                <p>{text}</p>
              </div>
            ))}
          </div>

          <div className="messenger-reply-box">
            <button type="button" aria-label="Attach file">
              <i className="ti ti-paperclip" />
            </button>
            <input type="text" placeholder="Write a reply..." />
            <button className="send" type="button" aria-label="Send reply">
              <i className="ti ti-send-2" />
            </button>
          </div>
        </section>
      </section>
    </div>
  );
}

export default Messages;
