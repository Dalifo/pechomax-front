import { useCallback, useEffect, useState } from 'react';
import { addPostComment, getPostById, setPostLiked, setPostSaved } from '../services/postService';
import { CatchPostDetail, EntityId } from '../types/domain';

type PostDetailState = {
  data: CatchPostDetail | null;
  loading: boolean;
  error: string | null;
};

export function usePostDetail(postId: EntityId) {
  const [state, setState] = useState<PostDetailState>({ data: null, loading: true, error: null });

  const refresh = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: null }));

    try {
      const post = await getPostById(postId);
      setState({ data: post, loading: false, error: post ? null : 'Publication introuvable.' });
    } catch {
      setState({ data: null, loading: false, error: 'Impossible de charger la publication.' });
    }
  }, [postId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const toggleLike = useCallback(async () => {
    if (!state.data) {
      return;
    }

    const nextLiked = !state.data.liked;
    setState((current) => current.data ? {
      ...current,
      data: {
        ...current.data,
        liked: nextLiked,
        likes: Math.max(0, current.data.likes + (nextLiked ? 1 : -1)),
      },
    } : current);

    try {
      const social = await setPostLiked(postId, nextLiked);
      setState((current) => current.data ? {
        ...current,
        data: {
          ...current.data,
          bookmarked: social.isSavedByMe,
          comments: Number(social.commentsCount),
          liked: social.isLikedByMe,
          likes: Number(social.likesCount),
          saves: Number(social.savesCount),
        },
      } : current);
    } catch {
      refresh();
    }
  }, [postId, refresh, state.data]);

  const toggleSave = useCallback(async () => {
    if (!state.data) {
      return;
    }

    const nextSaved = !state.data.bookmarked;
    setState((current) => current.data ? {
      ...current,
      data: { ...current.data, bookmarked: nextSaved, saves: Math.max(0, current.data.saves + (nextSaved ? 1 : -1)) },
    } : current);

    try {
      const social = await setPostSaved(postId, nextSaved);
      setState((current) => current.data ? {
        ...current,
        data: {
          ...current.data,
          bookmarked: social.isSavedByMe,
          comments: Number(social.commentsCount),
          liked: social.isLikedByMe,
          likes: Number(social.likesCount),
          saves: Number(social.savesCount),
        },
      } : current);
    } catch {
      refresh();
    }
  }, [postId, refresh, state.data]);

  const submitComment = useCallback(async (content: string) => {
    const comment = await addPostComment(postId, content);
    setState((current) => current.data ? {
      ...current,
      data: {
        ...current.data,
        comments: current.data.comments + 1,
        commentsList: [...current.data.commentsList, comment],
      },
    } : current);
  }, [postId]);

  return { ...state, refresh, submitComment, toggleLike, toggleSave };
}
