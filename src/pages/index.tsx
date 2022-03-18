import { format } from "date-fns";
import ptBR from 'date-fns/locale/pt-BR'

import { FiCalendar, FiUser } from "react-icons/fi"
import  Link from 'next/link'

import { GetStaticProps } from 'next';
import  Head  from 'next/head';

import * as prismic from '@prismicio/client'
import { getPrismicClient } from '../services/prismic';

import styles from './home.module.scss';
import { useState } from "react";

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
  preview: boolean
}

export default function Home({postsPagination, preview,}: HomeProps ): JSX.Element {
  const { results, next_page } = postsPagination
  
  const [posts, setPosts] = useState(results)
  const [nextPage, setNextPage] = useState(next_page)
  
  async function getPostNextPage() {

    if(nextPage === null){
      return
    }

    const NextPageRes = await fetch(nextPage)
    const NextPageData = await NextPageRes.json()

    const newResults = NextPageData.results.map(
      (posts: Post) => {
        return {
          uid: posts.uid,
          first_publication_date: posts.first_publication_date,  
          data: {
            title: posts.data.title,
            subtitle: posts.data.subtitle,
            author: posts.data.author 
          }
        }
      }
    )
    
    setNextPage(NextPageData.next_page)

    setPosts(oldPosts => [...oldPosts, ...newResults])

  }

  return (
    <>
      <Head>
        <title>Home | AprendizadoReact</title>
      </Head> 

      <main className={styles.container}>
        <img src="images/logo.svg" alt="logo" />
            {
              posts.map((post: Post) => {
                return (
                  <Link key={post.uid} href={`post/${post.uid}`}>
                    <a className={styles.post}>
                      <h2>{post.data.title}</h2>
                      <p>{post.data.subtitle}</p>
                      <time> <FiCalendar/> {format(new Date(post.first_publication_date),"dd MMM yyyy",{ locale: ptBR})} </time>
                      <span> <FiUser/>{post.data.author}</span>
                    </a>
                  </Link>    
                )
              })
            }
            {
              nextPage !== null 
              ? <button 
                  className={styles.morePosts}
                  onClick={getPostNextPage}
                >
                  Carregar mais posts
                </button>
              : <></>
            }
      </main>

      {
        preview && (
          <aside className={styles.preview}>
            <Link href="/api/exit-preview">
              <a> Sair do modo Preview</a>
            </Link>
          </aside>
        )
      }

    </>
  )
}

export const getStaticProps: GetStaticProps = async ({preview = false, previewData }) => {
  const client = getPrismicClient({previewData});

  const postsResponse = await client.get({
    predicates: prismic.predicate.at('document.type', 'posts'),
    lang: 'pt-br',
    ref: previewData?.ref ?? null,
    pageSize: 3,
    orderings: 'document.first_publication_date',
  })

  const results = postsResponse.results.map(posts => {
      return {
        uid: posts.uid,
        // first_publication_date: format(new Date(posts.first_publication_date),"dd MMM yyyy",{ locale: ptBR}),  
        first_publication_date: posts.first_publication_date,
        data: {
          title: posts.data.title,
          subtitle: posts.data.subtitle,
          author: posts.data.author 
        }
      }
    }
  )

  let next_page = postsResponse.next_page

  return {
    props: {
      postsPagination: {
        results, 
        next_page 
      },
      preview
    }
  }

};
