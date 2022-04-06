import React, { useState, useEffect, VFC } from 'react';
import styles from './Post.module.css';
import { db } from '../firebase';
import firebase from 'firebase/app';
import { useSelector } from 'react-redux';
import { selectUser } from '../features/userSlice';
import { Avatar } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import MessageIcon from '@material-ui/icons/Message';
import SendIcon from '@material-ui/icons/Send';

export type Props = {
  postId: string;
  avatar: string;
  image: string;
  text: string;
  timestamp: any;
  username: string;
};

type Comment = {
  id: string;
  avatar: string;
  text: string;
  timestamp: any;
  username: string;
};

// const Post: React.FC<Props> = (props) => {
const Post: VFC<{ post: Props }> = (props) => {
  const user = useSelector(selectUser);
  const { avatar, image, text, timestamp, username, postId } = props.post;
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState<Array<Comment>>([
    {
      id: '',
      avatar: '',
      text: '',
      username: '',
      timestamp: null,
    },
  ]);
  const [openComments, setOpenComments] = useState(false);

  //firebaseのDBからコメントを取得する処理
  useEffect(() => {
    const unSub = db
      .collection('posts')
      .doc(postId)
      .collection('comments')
      .orderBy('timestamp', 'desc')
      .onSnapshot((snapshot) => {
        setComments(
          snapshot.docs.map((doc) => ({
            id: doc.id,
            avatar: doc.data().avatar,
            text: doc.data().text,
            username: doc.data().username,
            timestamp: doc.data().timestamp,
          }))
        );
      });
    return () => {
      unSub();
    };
  }, [postId]);

  const newComment = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    db.collection('posts').doc(postId).collection('comments').add({
      avatar: user.photoUrl,
      text: comment,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      username: user.displayName,
    });
    setComment('');
  };

  return (
    <div className={styles.post}>
      <div className={styles.post_avatar}>
        <Avatar src={avatar} />
      </div>
      <div className={styles.post_body}>
        <div>
          <div className={styles.post_header}>
            <h3>
              <span className={styles.post_headerUser}>@{username}</span>
              <span className={styles.post_headerTime}>
                {new Date(timestamp?.toDate()).toLocaleString()}
              </span>
            </h3>
          </div>
          <div className={styles.post_tweet}>
            <p>{text}</p>
          </div>
        </div>
        {image && (
          <div className={styles.post_tweetImage}>
            <img src={image} alt="tweet" />
          </div>
        )}
        <MessageIcon
          className={styles.post_commentIcon}
          onClick={() => setOpenComments(!openComments)}
        />

        {openComments && (
          <>
            {comments.map((com) => (
              <div key={com.id} className={styles.post_comment}>
                <Avatar src={com.avatar} />
                <span className={styles.post_commentUser}>@{com.username}</span>
                <span className={styles.post_commentText}>{com.text}</span>
                <span className={styles.post_headerTime}>
                  {new Date(com.timestamp?.toDate()).toLocaleString()}
                </span>
              </div>
            ))}

            <form onSubmit={newComment}>
              <div className={styles.post_form}>
                <input
                  type="text"
                  className={styles.post_input}
                  placeholder="Type new comment..."
                  value={comment}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setComment(e.target.value)
                  }
                />
                <button
                  disabled={!comment}
                  type="submit"
                  className={
                    comment ? styles.post_button : styles.post_buttonDisable
                  }
                >
                  <SendIcon className={styles.post_sendIcon} />
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default Post;
