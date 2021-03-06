import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useState } from 'react';

import Header from '../../components/Header';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import { formatDate } from 'utils/formatDate';

import { getPrismicClient } from '../../services/prismic';
import { RichText } from 'prismic-dom';

import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  const router = useRouter();
  const [numberOfWords, setNumberOfWords] = useState(0);

  if (router.isFallback) {
    return <div>Carregando...</div>;
  }

  const handleCountText = useCallback(() => {
    post.data.content.map(item => {
      item.body.map(({ text }) => {
        const contWords = text.split(' ').length;
        setNumberOfWords(Math.round((numberOfWords + contWords) / 200));
      });
    });
  }, [numberOfWords, post.data.content]);

  useEffect(() => {
    handleCountText();
  }, [handleCountText]);

  const headings =
    post.data.content.length &&
    post.data.content.map(item => (
      <>
        <h3>{item.heading}</h3>
        <div dangerouslySetInnerHTML={{ __html: RichText.asHtml(item.body) }} />
      </>
    ));

  return (
    <>
      <Header />
      <div className={styles.wrapper}>
        <img
          src={post.data.banner.url}
          alt={`Imagem é um banner que representa o post ${post.data.title}`}
        />

        <div className={styles.container_post}>
          <h1>{post.data.title}</h1>
          <div>
            <span>
              <FiCalendar size={20} />
              {formatDate(post.first_publication_date)}
            </span>
            <span>
              <FiUser size={20} />
              {post.data.author}
            </span>
            <span>
              <FiClock size={20} />
              {numberOfWords} min
            </span>
          </div>

          {headings}
        </div>
      </div>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query('');

  const paths = posts.results.map(post => ({
    params: { slug: post.uid },
  }));

  return { paths, fallback: true };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const prismic = getPrismicClient();
  const options = { lang: 'pt-br' };
  const post = await prismic.getByUID('posts', `${params.slug}`, options);

  return {
    props: {
      post,
    },
    revalidate: 60 * 60 * 24, // 24 hours
  };
};
