import Head from 'next/head'
import { useState } from 'react'

import styles from '../styles/Home.module.css'
import formStyles from '../styles/forms.module.css'

import forms from '../components/authenticate-form'

export default function Home() {
  const [isLogin, setIsLogin] = useState(false);

  function handleClick(e) {
    setIsLogin(e.target.checked);
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Stock Trading Simulator
        </h1>

        <p className={styles.description}>
          Get started with a virtual $100000 and test out your trading strategies
          without wasting a single cent.
        </p>

      <ToggleableForm isLogin={isLogin} handleClick={handleClick}/>
      </main>

      <footer className={styles.footer}>
        Created by {' '} <a href='https://iamandywu.com'> Andy Wu </a> <br/>
        The repo is available to view on {' '} <a href='https://github.com/Andy-Wu12/Stock-Trading-Sim'> Github </a>
      </footer>
    </div>
  )
}

function ToggleableForm({isLogin, handleClick}) {
  return (
    <div className='toggleSwitch'>
      <label for="toggleForm"> Need to sign up? </label>
      <input id="toggleForm" type="checkbox" checked={isLogin} onClick={handleClick} />
    </div>
  )
}