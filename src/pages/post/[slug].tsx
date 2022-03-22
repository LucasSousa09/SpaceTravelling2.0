import Header from '../../components/Header'
import * as prismic from '@prismicio/client' 

import { FiCalendar, FiUser, FiClock } from "react-icons/fi"

import { GetStaticPaths, GetStaticProps } from 'next';

import { getPrismicClient } from '../../services/prismic';

import styles from './post.module.scss';

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { useRouter } from 'next/router';
import Link from 'next/link';

import Comments from "../../components/Comments"

interface OtherPost {
  prevPost: {
    first_publication_date: string | null;
    title: string;
    uid: string
  }
  nextPost: {
    first_publication_date: string | null;
    title: string;
    uid: string
  }
}

interface Post {
  first_publication_date: string | null;
  last_publication_date: string | null;
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
  post: Post,
  preview: boolean,
  otherPosts: OtherPost
}

export default function Post(props: PostProps) {
  const { post, preview, otherPosts } = props
  const router = useRouter()

  const thisUrlPath = router.asPath
  
  if(router.isFallback){
    return <p>Carregando...</p>
  }

  const postContent = post.data.content

  const readingTime = postContent.map(
    content => {
      const postBody = content.body.map(
        body => {
          return body.text
        }
      )

      return (
        `${content.heading} ${postBody}`
      )
    }
  ).join().match(/\S+/g).length

  return (
    <>
      <Header/>
        {
          post &&
          
          <div className={styles.postContainer}>
            <img src={post.data.banner.url} alt="image" /> 
            <div className={styles.articleContainer}>              
              <h1>{post.data.title}</h1>
              <div className={styles.miscellaneousInformation}>
                <time> <FiCalendar/>{format(new Date(post.first_publication_date),"dd MMM yyyy",{ locale: ptBR})}</time>
                <span><FiUser/>{post.data.author}</span>
                <span><FiClock/>{Math.ceil(readingTime / 200)} min</span>
                {
                  post.last_publication_date ?
                  (
                    <div>
                      <span className={styles.italicSpan}>* editado em {post.last_publication_date} </span>
                    </div>
                  )
                  :
                  ''
                }
              </div>  
                {
                  post.data.content.map(
                    (content, index) => {
                      return (
                        <div key={index}>
                          <h2>{content.heading}</h2>
                          {content.body.map(
                            (body, index) => {
                              return <p key={`Par: ${index}`}>{body.text}</p>
                            }
                          )}
                        </div>
                      )
                    }
                  )
                }
            <hr/>
            <Comments thisUrlPath={thisUrlPath}/>
            <nav className={styles.postNavegation}>
              <ul>
                <li>
                  {
                    otherPosts.prevPost.uid !== '' ?
                    (
                      <Link href={`/post/${otherPosts.prevPost.uid}`}>
                        <a>
                          <p> { otherPosts.prevPost.title } </p>
                          <span> Post anterior </span> 
                        </a>
                      </Link>
                    ) :
                    ''
                  }
                </li>
                <li>
                  {
                    otherPosts.nextPost.uid !== '' ? 
                    (
                      <Link href={`/post/${otherPosts.nextPost.uid}`}>
                        <a href="#">
                          <p> {otherPosts.nextPost.title} </p>
                          <span> Próximo post </span> 
                        </a> 
                      </Link>
                    ) :
                    ''
                  }
                </li>
              </ul>
            </nav>
            </div>
          </div>
          
          
        }
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

export const getStaticPaths: GetStaticPaths = async () => {
  const client = getPrismicClient();
  const posts = await client.get({
    predicates: prismic.predicate.at('document.type', 'posts')
  });

  
  const paths = posts.results.map(post => ({
    params: {slug: post.uid} 
  }))

  return {
    paths: paths,
    fallback: true
  }
};

export const getStaticProps: GetStaticProps = async (context) => {
  const  slug  = context.params.slug as string

  const previewData = context?.previewData ?? ''
  const preview = context?.preview ?? ''

  const client = getPrismicClient(previewData ? {previewData} : '');
  const response = await client.getByUID('posts', slug);

  const nextPostResult = await client.get({
    predicates: prismic.predicate.at('document.type', 'posts'),
    pageSize: 1,
    after: response?.id,
    orderings: 'document.first_publication_date'
  })

  const prevPostResult = await client.get({
    predicates: prismic.predicate.at('document.type', 'posts'),
    pageSize: 1,
    after: response?.id,
    orderings: 'document.first_publication_date desc'
  })

  const otherPosts = {
    nextPost: {
      uid: nextPostResult.results[0]?.uid ?? '',
      title: nextPostResult.results[0]?.data.title ?? '',
      first_publication_date: nextPostResult.results[0]?.first_publication_date ?? ''
    },
    prevPost: {
      uid: prevPostResult.results[0]?.uid ?? '',
      title: prevPostResult.results[0]?.data.title ?? '',
      first_publication_date: nextPostResult?.results[0]?.first_publication_date ?? '',
    }
  }

  const content = response.data.content.map(
    (content: any) => {
      return {
          heading: content.heading,
          body: content.body
      }
    }
  )

  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    last_publication_date: format(new Date(response.last_publication_date),"dd MMM yyyy, 'às' HH:mm",{ locale: ptBR}),
    data: {
        title: response.data.title,
        subtitle: response.data.subtitle,
        banner: {
          url: response.data.banner.url
        },
        author: response.data.author,
        content: content,
      }
    }
  
  return{
    props:{
     post: post,
     preview,
     otherPosts 
    }
  }
};