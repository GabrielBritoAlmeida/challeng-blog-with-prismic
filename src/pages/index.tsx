import { GetStaticProps } from 'next';
import Link from 'next/link';

import { getPrismicClient } from '../services/prismic';

import { formatDate } from 'utils/formatDate';

import { FiCalendar, FiUser } from 'react-icons/fi';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {
  const allPosts =
    postsPagination.results.length &&
    postsPagination.results.map(post => (
      <div className={styles.post} key={post.uid}>
        <Link href={`/post/${post.uid}`}>
          <a>
            <strong>{post.data.title}</strong>
            <p>{post.data.subtitle}</p>
            <div>
              <span>
                <FiCalendar size={20} /> {post.first_publication_date}
              </span>
              <span>
                <FiUser size={20} /> {post.data.author}
              </span>
            </div>
          </a>
        </Link>
      </div>
    ));

  return (
    <div className={commonStyles.container}>
      <div className={styles.container_home}>
        <img src="/logo.svg" alt="logo" />

        {allPosts}

        {postsPagination.next_page && <strong>Carregar mais posts</strong>}
      </div>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();

  const postsResponse = await prismic.query('');

  const posts = postsResponse.results.map((post: Post) => {
    const newDate = formatDate(post.first_publication_date);

    return {
      uid: post.uid,
      first_publication_date: newDate,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
    };
  });

  return {
    props: {
      postsPagination: {
        results: posts,
        next_page: postsResponse.next_page,
      },
    },
    revalidate: 60 * 60 * 24, // 24 hours
  };
};
