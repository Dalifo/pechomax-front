import { useCallback, useEffect, useState } from 'react';
import { createPost, CreatePostInput, getPosts, setPostLiked, setPostSaved } from '../services/postService';
import { CatchPost, EntityId } from '../types/domain';

type PostsState = {
  data: CatchPost[];
  loading: boolean;
  error: string | null;
};

export function usePosts() {
  const [state, setState] = useState<PostsState>({ data: [], loading: true, error: null });

  const refresh = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: null }));

    try {
      const posts = await getPosts();
      setState({ data: posts, loading: false, error: null });
    } catch {
      setState({ data: [], loading: false, error: 'Impossible de charger les publications.' });
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const toggleLike = useCallback(async (postId: EntityId) => {
    const post = state.data.find((item) => item.id === postId);
    if (!post) {
      return;
    }

    const nextLiked = !post.liked;
    setState((current) => ({
      ...current,
      data: current.data.map((post) =>
        post.id === postId
          ? { ...post, liked: nextLiked, likes: Math.max(0, post.likes + (nextLiked ? 1 : -1)) }
          : post,
      ),
    }));
    try {
      const social = await setPostLiked(postId, nextLiked);
      setState((current) => ({
        ...current,
        data: current.data.map((item) =>
          item.id === postId
            ? { ...item, comments: Number(social.commentsCount), liked: social.isLikedByMe, likes: Number(social.likesCount) }
            : item,
        ),
      }));
    } catch {
      refresh();
    }
  }, [refresh, state.data]);

  const toggleBookmark = useCallback(async (postId: EntityId) => {
    const post = state.data.find((item) => item.id === postId);
    if (!post) {
      return;
    }

    const nextSaved = !post.bookmarked;
    setState((current) => ({
      ...current,
      data: current.data.map((post) =>
        post.id === postId ? { ...post, bookmarked: nextSaved } : post,
      ),
    }));
    try {
      const social = await setPostSaved(postId, nextSaved);
      setState((current) => ({
        ...current,
        data: current.data.map((item) =>
          item.id === postId
            ? { ...item, bookmarked: social.isSavedByMe }
            : item,
        ),
      }));
    } catch {
      refresh();
    }
  }, [refresh, state.data]);

  return { ...state, refresh, toggleBookmark, toggleLike };
}

export function useCreatePost() {
  const [submitting, setSubmitting] = useState(false);

  const submitPost = useCallback(async (input: CreatePostInput) => {
    setSubmitting(true);
    try {
      return await createPost(input);
    } finally {
      setSubmitting(false);
    }
  }, []);

  return { submitPost, submitting };
}
