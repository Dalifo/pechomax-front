import { useCallback, useEffect, useState } from 'react';
import { createPost, CreatePostInput, getPosts } from '../services/postService';
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

  const toggleLike = useCallback((postId: EntityId) => {
    setState((current) => ({
      ...current,
      data: current.data.map((post) =>
        post.id === postId
          ? { ...post, liked: !post.liked, likes: post.liked ? post.likes - 1 : post.likes + 1 }
          : post,
      ),
    }));
  }, []);

  const toggleBookmark = useCallback((postId: EntityId) => {
    setState((current) => ({
      ...current,
      data: current.data.map((post) =>
        post.id === postId ? { ...post, bookmarked: !post.bookmarked } : post,
      ),
    }));
  }, []);

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
