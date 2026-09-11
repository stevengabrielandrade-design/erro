import React, { useState } from 'react';
import { CommunityComment, CommunityPost, UserSettings } from '../types';
import {
  Users,
  Send,
  Heart,
  MessageSquare,
  Share2,
  ExternalLink,
  PlusCircle,
  Pin,
  Sparkles,
} from 'lucide-react';

interface CommunityViewProps {
  posts: CommunityPost[];
  comments: CommunityComment[];
  settings: UserSettings | null;
  onLikePost: (postId: string) => void;
  onAddPost: (title: string, content: string, category: string) => void;
  onAddComment: (postId: string, content: string) => void;
}

export const CommunityView: React.FC<CommunityViewProps> = ({
  posts,
  comments,
  settings,
  onLikePost,
  onAddPost,
  onAddComment,
}) => {
  const telegramUrl = settings?.telegram_channel_url || 'https://t.me/uchihadabet_oficial';
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState<'PRE_LIVE' | 'ANALISE' | 'AVISO'>('PRE_LIVE');
  const [activeCommentsPostId, setActiveCommentsPostId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;
    onAddPost(newTitle, newContent, newCategory);
    setNewTitle('');
    setNewContent('');
    setShowNewPostModal(false);
  };

  const handleSendComment = (postId: string) => {
    if (!commentText.trim()) return;
    onAddComment(postId, commentText);
    setCommentText('');
  };

  return (
    <div className="space-y-6 pb-24 animate-in fade-in duration-300">
      {/* Telegram Channel VIP Banner (Requirement 33) */}
      <div className="bg-gradient-to-r from-blue-950/70 via-[#0c1829] to-[#121216] border border-blue-800/50 rounded-2xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/30 shrink-0">
            <Send className="w-6 h-6 -rotate-12 translate-x-0.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-white">Canal Oficial no Telegram</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                VIP LIVE & PRÉ-LIVE
              </span>
            </div>
            <p className="text-xs text-zinc-300 mt-1 max-w-lg leading-relaxed">
              Receba análises pré-live, avisos de gestão de banca e interaja com os melhores operadores do Uchiha da Bet.
            </p>
          </div>
        </div>

        <a
          href={telegramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs tracking-wide shadow-lg shadow-blue-600/40 flex items-center gap-2 active:scale-95 transition-all"
        >
          <span>ENTRAR NO TELEGRAM</span>
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      {/* Community Feed Header & Post Creator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-orange-500" />
          <h3 className="text-sm font-extrabold text-white uppercase tracking-wider font-mono">
            Comunidade & Análises Técnicas
          </h3>
        </div>

        <button
          onClick={() => setShowNewPostModal(true)}
          className="px-3.5 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          Publicar Análise
        </button>
      </div>

      {/* New Post Modal */}
      {showNewPostModal && (
        <div className="bg-[#121216] border border-orange-900/50 rounded-2xl p-4 shadow-xl space-y-3">
          <h4 className="text-sm font-bold text-white">Nova Publicação na Comunidade</h4>
          <form onSubmit={handleCreatePost} className="space-y-3">
            <input
              type="text"
              placeholder="Título da análise (ex: Arsenal x Chelsea: radar ligado)"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500"
            />
            <textarea
              rows={3}
              placeholder="Compartilhe seu racional ou análise pré-live..."
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500"
            />
            <div className="flex items-center justify-between">
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as any)}
                className="bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-zinc-300 font-semibold focus:outline-none"
              >
                <option value="PRE_LIVE">🎯 Aposta Pré-Live</option>
                <option value="ANALISE">📊 Análise Técnica</option>
                <option value="AVISO">📢 Aviso / Feedback</option>
              </select>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewPostModal(false)}
                  className="px-3 py-1.5 rounded-lg text-xs text-zinc-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs"
                >
                  Publicar
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Posts List */}
      <div className="space-y-4">
        {posts.map((post) => {
          const postComments = comments.filter((c) => c.post_id === post.post_id);
          const isCommentsOpen = activeCommentsPostId === post.post_id;

          return (
            <div
              key={post.post_id}
              className={`bg-[#121216] border rounded-2xl p-4 sm:p-5 transition-all ${
                post.pinned
                  ? 'border-orange-600/40 bg-gradient-to-b from-orange-950/10 to-[#121216]'
                  : 'border-zinc-800'
              }`}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <img
                    src={post.author_avatar}
                    alt={post.author_name}
                    className="w-9 h-9 rounded-full object-cover border border-zinc-700"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white">{post.author_name}</span>
                      <span
                        className={`text-[9px] font-black px-1.5 py-0.2 rounded font-mono ${
                          post.author_badge === 'PROPRIETÁRIO'
                            ? 'bg-red-950 text-red-400 border border-red-800'
                            : post.author_badge === 'VIP'
                            ? 'bg-orange-950 text-orange-400 border border-orange-800'
                            : 'bg-zinc-800 text-zinc-300'
                        }`}
                      >
                        {post.author_badge}
                      </span>
                    </div>
                    <span className="text-[10px] text-zinc-500">
                      {new Date(post.created_at).toLocaleDateString('pt-PT')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {post.pinned && (
                    <span className="text-[10px] font-bold text-orange-400 flex items-center gap-1 bg-orange-950/60 px-2 py-0.5 rounded-full border border-orange-800/40">
                      <Pin className="w-3 h-3" /> FIXADO
                    </span>
                  )}
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                    {post.category}
                  </span>
                </div>
              </div>

              {/* Title & Content */}
              <h4 className="text-sm sm:text-base font-extrabold text-white leading-snug">
                {post.title}
              </h4>
              <p className="text-xs text-zinc-300 mt-2 leading-relaxed whitespace-pre-line">
                {post.content}
              </p>

              {/* Actions Footer */}
              <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => onLikePost(post.post_id)}
                    className={`flex items-center gap-1 font-semibold transition-colors active:scale-95 ${
                      post.user_liked ? 'text-red-500' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${post.user_liked ? 'fill-red-500' : ''}`} />
                    <span>{post.likes}</span>
                  </button>

                  <button
                    onClick={() => setActiveCommentsPostId(isCommentsOpen ? null : post.post_id)}
                    className="flex items-center gap-1 text-zinc-400 hover:text-white transition-colors"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>{post.comments_count || postComments.length} comentários</span>
                  </button>
                </div>

                <div className="text-[11px] text-zinc-500">
                  Uchiha da Bet Community
                </div>
              </div>

              {/* Comments Section */}
              {isCommentsOpen && (
                <div className="mt-3 pt-3 border-t border-zinc-900 space-y-2">
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {postComments.map((comm) => (
                      <div key={comm.comment_id} className="bg-zinc-950 p-2 rounded-lg text-xs">
                        <strong className="text-zinc-300">{comm.author_name}: </strong>
                        <span className="text-zinc-400">{comm.content}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="text"
                      placeholder="Escreva um comentário..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500"
                    />
                    <button
                      onClick={() => handleSendComment(post.post_id)}
                      className="px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs"
                    >
                      Enviar
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
