export type Vote = { userId: string; value: 1 | -1 };
export type Comment = {
  id: string;
  postId: string;
  author: string;
  content: string;
  votes: Vote[];
  createdAt: string;
};
export type Post = {
  id: string;
  subreddit: string;
  title: string;
  content: string;
  author: string;
  votes: Vote[];
  createdAt: string;
};
export type Subreddit = {
  slug: string;
  title: string;
  description: string;
};

export const subreddits: Subreddit[] = [
  { slug: "tech", title: "Tech", description: "Actualités et technologies" },
  { slug: "gaming", title: "Gaming", description: "Jeux vidéo et e-sport" },
  { slug: "news", title: "News", description: "Actualités générales" },
];

export const posts: Post[] = [
  {
    id: "p1",
    subreddit: "tech",
    title: "Nouveau framework JS",
    content: "Un nouveau framework prometteur vient de sortir...",
    author: "alice",
    votes: [{ userId: "u1", value: 1 }],
    createdAt: "2025-12-01T10:00:00Z",
  },
  {
    id: "p2",
    subreddit: "gaming",
    title: "Patch notes 1.2",
    content: "Équilibrage des classes et nouvelles cartes.",
    author: "bob",
    votes: [
      { userId: "u1", value: 1 },
      { userId: "u2", value: -1 },
    ],
    createdAt: "2025-12-02T12:00:00Z",
  },
  {
    id: "p3",
    subreddit: "news",
    title: "Événement mondial",
    content: "Un fait marquant s'est produit aujourd'hui...",
    author: "carol",
    votes: [],
    createdAt: "2025-12-03T09:30:00Z",
  },
];

export const comments: Comment[] = [
  {
    id: "c1",
    postId: "p1",
    author: "bob",
    content: "Intéressant, hâte d'essayer.",
    votes: [{ userId: "u2", value: 1 }],
    createdAt: "2025-12-01T11:00:00Z",
  },
  {
    id: "c2",
    postId: "p2",
    author: "carol",
    content: "Le patch corrige enfin le bug critique.",
    votes: [],
    createdAt: "2025-12-02T13:00:00Z",
  },
];

