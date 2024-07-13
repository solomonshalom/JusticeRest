import firebase, { firestore } from './firebase'

type User = {
  id: string;
  name: string;
  posts: string[];
  // Add other user fields as needed
};

type Post = {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  published: boolean;
  lastEdited: firebase.firestore.Timestamp;
  slug: string;
  category?: string;
  // Add other post fields as needed
};

export async function userWithIDExists(id: string): Promise<boolean> {
  const doc = await firestore.collection('users').doc(id).get();
  return doc.exists;
}

export async function userWithNameExists(name: string): Promise<boolean> {
  const query = await firestore
    .collection('users')
    .where('name', '==', name)
    .get();

  return !query.empty;
}

export async function getUserByID(id: string): Promise<User> {
  const doc = await firestore.collection('users').doc(id).get();
  if (!doc.exists) {
    throw { code: 'user/not-found' };
  }

  const user = doc.data() as User;
  const postDocPromises = user.posts.map(postId => getPostByID(postId));
  user.posts = await Promise.all(postDocPromises);

  return { id: doc.id, ...user };
}

export async function getUserByName(name: string): Promise<User> {
  const query = await firestore
    .collection('users')
    .where('name', '==', name)
    .get();

  if (query.empty || !query.docs[0].exists) {
    throw { code: 'user/not-found' };
  }

  const user = { id: query.docs[0].id, ...query.docs[0].data() } as User;
  const postDocPromises = user.posts.map(postId => getPostByID(postId));
  user.posts = await Promise.all(postDocPromises);

  return user;
}

export async function getPostByID(id: string): Promise<Post> {
  const doc = await firestore.collection('posts').doc(id).get();
  if (!doc.exists) {
    throw { code: 'post/not-found' };
  }

  return { id: doc.id, ...doc.data() } as Post;
}

export async function removePostForUser(uid: string, pid: string): Promise<void> {
  await firestore.collection('posts').doc(pid).delete();
  await firestore
    .collection('users')
    .doc(uid)
    .update({ posts: firebase.firestore.FieldValue.arrayRemove(pid) });
}

export async function postWithIDExists(id: string): Promise<boolean> {
  const doc = await firestore.collection('posts').doc(id).get();
  return doc.exists;
}

export async function postWithUsernameAndSlugExists(username: string, slug: string): Promise<boolean> {
  const user = await getUserByName(username);
  return !!user.posts.find(post => post.slug === slug);
}

export async function postWithUserIDAndSlugExists(uid: string, slug: string): Promise<boolean> {
  const user = await getUserByID(uid);
  return !!user.posts.find(post => post.slug === slug);
}

export async function getPostByUsernameAndSlug(username: string, slug: string): Promise<Post> {
  const user = await getUserByName(username);
  const post = user.posts.find(post => post.slug === slug);
  if (!post) {
    throw { code: 'post/not-found' };
  }

  return post;
}

export async function updatePostCategory(postId: string, category: string): Promise<void> {
  await firestore.collection('posts').doc(postId).update({ category });
}

export async function setUser(id: string, data: Partial<User>): Promise<void> {
  await firestore.collection('users').doc(id).set(data);
}

export async function setPost(id: string, data: Partial<Post>): Promise<void> {
  await firestore.collection('posts').doc(id).set(data);
}

export async function createPostForUser(userId: string): Promise<string> {
  const doc = await firestore.collection('posts').add({
    title: '',
    excerpt: '',
    content: '',
    author: userId,
    published: false,
    lastEdited: firebase.firestore.Timestamp.now(),
  });

  await firestore.collection('posts').doc(doc.id).update({ slug: doc.id });

  await firestore
    .collection('users')
    .doc(userId)
    .update({ posts: firebase.firestore.FieldValue.arrayUnion(doc.id) });

  return doc.id;
}
