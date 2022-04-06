import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import TweetInput from './TweetInput';
import styles from './Feed.module.css';
import Post, { Props } from './Post';

const Feed: React.FC = () => {
  const [posts, setPosts] = useState([
    {
      postId: '',
      avatar: '',
      image: '',
      text: '',
      timestamp: null,
      username: '',
    },
  ]);

  useEffect(() => {
    const unSub = db
      .collection('posts')
      .orderBy('timestamp', 'desc')
      .onSnapshot((snapshot) => {
        // console.log(snapshot);
        setPosts(
          snapshot.docs.map((doc) => {
            // console.log(doc);
            return {
              postId: doc.id,
              avatar: doc.data().avatar,
              image: doc.data().image,
              text: doc.data().text,
              timestamp: doc.data().timestamp,
              username: doc.data().username,
            };
          })
        );
      });
    return () => {
      unSub();
    };
  }, []);

  return (
    <div className={styles.feed}>
      <TweetInput />
      {posts[0]?.postId && (
        <>
          {posts.map((post) => (
            <Post key={post.postId} post={post} />

            // <Post
            //   key={post.id}
            //   postId={post.id}
            //   avatar={post.avatar}
            //   image={post.image}
            //   text={post.text}
            //   timestamp={post.timestamp}
            //   username={post.username}
            // />
          ))}
        </>
      )}
    </div>
  );
};

export default Feed;
