import { useState } from 'react';
import { useApp, CommunityEvent, ForumPost, ForumReply } from '../context/AppContext';
import {
  Calendar, Megaphone, MessageSquare, Pin, Send, Plus, MapPin, X,
} from 'lucide-react';

/**
 * Community - Events & official updates feed + an interactive discussion forum.
 * Admins can post events/updates and pin announcements; all users can post and reply.
 * (Demo stage: content is stored per-device; a shared backend makes it multi-user.)
 */
export default function Community() {
  const {
    userRole, userName, events, addEvent, forumPosts, addForumPost, addForumReply,
  } = useApp();
  const isAdmin = userRole === 'admin';
  const displayName = userName || (isAdmin ? 'Kijani Hub Admin' : 'Member');

  const [tab, setTab] = useState<'events' | 'forum'>('events');

  // New event form (admin only)
  const [showEventForm, setShowEventForm] = useState(false);
  const [evt, setEvt] = useState({ title: '', date: '', location: '', description: '', type: 'event' as CommunityEvent['type'] });

  // New post form
  const [showPostForm, setShowPostForm] = useState(false);
  const [post, setPost] = useState({ title: '', body: '' });

  // Reply drafts keyed by post id
  const [replyDraft, setReplyDraft] = useState<Record<string, string>>({});

  const submitEvent = () => {
    if (!evt.title || !evt.date) return;
    addEvent({
      id: `evt-${Date.now()}`,
      title: evt.title, date: new Date(evt.date).toISOString(),
      location: evt.location || 'Dar es Salaam',
      description: evt.description, type: evt.type,
      createdAt: new Date().toISOString(),
    });
    setEvt({ title: '', date: '', location: '', description: '', type: 'event' });
    setShowEventForm(false);
  };

  const submitPost = () => {
    if (!post.title.trim()) return;
    addForumPost({
      id: `post-${Date.now()}`,
      author: displayName, role: userRole,
      title: post.title, body: post.body,
      pinned: false, createdAt: new Date().toISOString(), replies: [],
    });
    setPost({ title: '', body: '' });
    setShowPostForm(false);
  };

  const submitReply = (postId: string) => {
    const body = (replyDraft[postId] || '').trim();
    if (!body) return;
    const reply: ForumReply = {
      id: `r-${Date.now()}`, author: displayName, role: userRole, body,
      createdAt: new Date().toISOString(),
    };
    addForumReply(postId, reply);
    setReplyDraft((d) => ({ ...d, [postId]: '' }));
  };

  const typeBadge = (t: CommunityEvent['type']) => {
    const map = {
      event: { bg: 'bg-emerald-100', tx: 'text-emerald-700', label: 'Event' },
      update: { bg: 'bg-blue-100', tx: 'text-blue-700', label: 'Update' },
      announcement: { bg: 'bg-amber-100', tx: 'text-amber-700', label: 'Announcement' },
    }[t];
    return <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${map.bg} ${map.tx}`}>{map.label}</span>;
  };

  // Sort: pinned posts first, then newest
  const sortedPosts = [...forumPosts].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Community</h1>
        <p className="text-gray-600 mt-1">Events, official updates, and discussion for the Kijani Hub network</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button onClick={() => setTab('events')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px ${tab === 'events' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
          <Calendar size={17} /> Events & Updates
        </button>
        <button onClick={() => setTab('forum')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px ${tab === 'forum' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
          <MessageSquare size={17} /> Forum
        </button>
      </div>

      {/* ── EVENTS TAB ── */}
      {tab === 'events' && (
        <div className="space-y-4">
          {isAdmin && (
            <div>
              {!showEventForm ? (
                <button onClick={() => setShowEventForm(true)}
                  className="inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-emerald-700 transition-colors">
                  <Plus size={17} /> Post event or update
                </button>
              ) : (
                <div className="bg-white rounded-2xl shadow-md p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-800">New event / update</h3>
                    <button onClick={() => setShowEventForm(false)}><X size={18} className="text-gray-400" /></button>
                  </div>
                  <input placeholder="Title" value={evt.title} onChange={(e) => setEvt({ ...evt, title: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
                  <div className="grid md:grid-cols-3 gap-3">
                    <input type="date" value={evt.date} onChange={(e) => setEvt({ ...evt, date: e.target.value })}
                      className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
                    <input placeholder="Location" value={evt.location} onChange={(e) => setEvt({ ...evt, location: e.target.value })}
                      className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
                    <select value={evt.type} onChange={(e) => setEvt({ ...evt, type: e.target.value as CommunityEvent['type'] })}
                      className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
                      <option value="event">Event</option>
                      <option value="update">Update</option>
                      <option value="announcement">Announcement</option>
                    </select>
                  </div>
                  <textarea placeholder="Description" rows={3} value={evt.description} onChange={(e) => setEvt({ ...evt, description: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
                  <button onClick={submitEvent}
                    className="bg-emerald-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-emerald-700 transition-colors">Publish</button>
                </div>
              )}
            </div>
          )}

          {events.length === 0 ? (
            <p className="text-gray-400 text-sm">No events yet.</p>
          ) : (
            events.map((e) => (
              <div key={e.id} className="bg-white rounded-2xl shadow-md p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="bg-emerald-50 rounded-xl p-3 text-center min-w-[64px]">
                      <div className="text-xs text-emerald-600 font-semibold uppercase">
                        {new Date(e.date).toLocaleDateString('en', { month: 'short' })}
                      </div>
                      <div className="text-2xl font-bold text-emerald-700">{new Date(e.date).getDate()}</div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        {e.type === 'update' ? <Megaphone size={16} className="text-blue-500" /> : <Calendar size={16} className="text-emerald-500" />}
                        {typeBadge(e.type)}
                      </div>
                      <h3 className="font-bold text-gray-800">{e.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{e.description}</p>
                      <p className="text-xs text-gray-400 mt-2 flex items-center gap-1"><MapPin size={12} /> {e.location}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── FORUM TAB ── */}
      {tab === 'forum' && (
        <div className="space-y-4">
          {!showPostForm ? (
            <button onClick={() => setShowPostForm(true)}
              className="inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-emerald-700 transition-colors">
              <Plus size={17} /> Start a discussion
            </button>
          ) : (
            <div className="bg-white rounded-2xl shadow-md p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-800">New discussion</h3>
                <button onClick={() => setShowPostForm(false)}><X size={18} className="text-gray-400" /></button>
              </div>
              <input placeholder="Title" value={post.title} onChange={(e) => setPost({ ...post, title: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
              <textarea placeholder="What would you like to discuss?" rows={3} value={post.body} onChange={(e) => setPost({ ...post, body: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
              <button onClick={submitPost}
                className="bg-emerald-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-emerald-700 transition-colors">Post</button>
            </div>
          )}

          {sortedPosts.map((p: ForumPost) => (
            <div key={p.id} className={`bg-white rounded-2xl shadow-md p-6 ${p.pinned ? 'border-2 border-amber-200' : ''}`}>
              <div className="flex items-center gap-2 mb-2">
                {p.pinned && <Pin size={15} className="text-amber-500" />}
                <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm font-bold">
                  {p.author.charAt(0)}
                </span>
                <div>
                  <span className="font-semibold text-gray-800 text-sm">{p.author}</span>
                  <span className="text-xs text-gray-400 ml-2">{p.role.replace('_', ' ')} · {new Date(p.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <h3 className="font-bold text-gray-800">{p.title}</h3>
              {p.body && <p className="text-sm text-gray-600 mt-1">{p.body}</p>}

              {/* Replies */}
              {p.replies.length > 0 && (
                <div className="mt-4 space-y-3 border-l-2 border-gray-100 pl-4">
                  {p.replies.map((r) => (
                    <div key={r.id}>
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-xs font-bold">{r.author.charAt(0)}</span>
                        <span className="text-xs font-semibold text-gray-700">{r.author}</span>
                        <span className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1 ml-8">{r.body}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Reply box */}
              <div className="flex gap-2 mt-4">
                <input
                  placeholder="Write a reply…"
                  value={replyDraft[p.id] || ''}
                  onChange={(e) => setReplyDraft((d) => ({ ...d, [p.id]: e.target.value }))}
                  onKeyDown={(e) => { if (e.key === 'Enter') submitReply(p.id); }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
                <button onClick={() => submitReply(p.id)}
                  className="bg-emerald-600 text-white px-3 rounded-lg hover:bg-emerald-700 transition-colors">
                  <Send size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
