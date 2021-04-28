import Link from 'next/link';

import styles from './header.module.scss';

export default function Header() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <Link href="/" passHref>
          <img src="/logo.svg" alt="logo" />
        </Link>
      </div>
    </div>
  );
}
