import React, { useState } from 'react';
import styles from './TweetInput.module.css';
import { useSelector } from 'react-redux';
import { selectUser } from '../features/userSlice';
import { auth, storage, db } from '../firebase';
import { Avatar, Button, IconButton } from '@material-ui/core';
import firebase from 'firebase/app';
import AddPhotoIcon from '@material-ui/icons/AddAPhoto';

const TweetInput: React.FC = () => {
  const user = useSelector(selectUser);
  const [tweetImage, setTweetImage] = useState<File | null>(null);
  const [tweetMsg, setTweetMsg] = useState('');

  //画像を選択する処理
  const onChangeImageHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files![0]) {
      setTweetImage(e.target.files![0]);
      e.target.value = '';
    }
  };

  //ツイートボタン押下時の処理
  const sendTweet = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (tweetImage) {
      //★★★画像がある場合
      const S =
        'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      const N = 16;
      const randomChar = Array.from(crypto.getRandomValues(new Uint32Array(N)))
        .map((n) => S[n % S.length])
        .join('');
      const fileName = randomChar + '_' + tweetImage.name;
      const uploadTweetImg = storage.ref(`images/${fileName}`).put(tweetImage);
      uploadTweetImg.on(
        firebase.storage.TaskEvent.STATE_CHANGED,
        () => {},
        (err) => {
          alert(err.message);
        },
        async () => {
          await storage
            .ref('images')
            .child(fileName)
            .getDownloadURL()
            .then(async (url) => {
              await db.collection('posts').add({
                avatar: user.photoUrl,
                image: url,
                text: tweetMsg,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                username: user.displayName,
              });
            });
        }
      );
    } else {
      //★★★画像がない場合
      db.collection('posts').add({
        avatar: user.photoUrl,
        image: '',
        text: tweetMsg,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        username: user.displayName,
      });
    }
    //ツイート後、テキストと画像を初期化
    setTweetImage(null);
    setTweetMsg('');
  };

  return (
    <>
      <form onSubmit={sendTweet}>
        <div className={styles.tweet_form}>
          <Avatar
            className={styles.tweet_avatar}
            src={user.photoUrl}
            onClick={async () => {
              await auth.signOut();
            }}
          />
          <input
            type="text"
            className={styles.tweet_input}
            placeholder="What's happening?"
            autoFocus
            value={tweetMsg}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setTweetMsg(e.target.value)
            }
          />
          <IconButton>
            <label>
              <AddPhotoIcon
                className={
                  tweetImage ? styles.tweet_addIconLoaded : styles.tweet_addIcon
                }
              />
              <input
                type="file"
                className={styles.tweet_hiddenIcon}
                onChange={onChangeImageHandler}
              />
            </label>
          </IconButton>
        </div>
        <Button
          type="submit"
          disabled={!tweetMsg}
          className={
            tweetMsg ? styles.tweet_sendBtn : styles.tweet_sendDisableBtn
          }
        >
          Tweet
        </Button>
      </form>
    </>
  );
};

export default TweetInput;
