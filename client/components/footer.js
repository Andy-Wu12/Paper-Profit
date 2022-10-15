import styles from '../styles/Home.module.css'

export default function footer() {
  return (
    <footer className={styles.footer}>
      Created by {' '} <a href='https://iamandywu.com'> Andy Wu </a> <br/>
      The repo is available to view on {' '} <a href='https://github.com/Andy-Wu12/Stock-Trading-Sim'> Github </a>
    </footer>
  )
}