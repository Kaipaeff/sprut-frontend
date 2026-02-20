import { Outlet, NavLink, Link } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import styles from './Layout.module.css';

export function Layout() {
  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <nav className={styles.nav}>
          <div className={styles.navLeft}>
            <Link to={ROUTES.HOME} className={styles.logo}>
              <img src={`${import.meta.env.BASE_URL}mio.png`} alt="MIO Body Sprut" className={styles.logoImg} />              <span className={styles.logoText}>
                <span className={styles.logoMio}>MIO</span>
                <span className={styles.logoBottom}>
                  <svg className={styles.logoPulse} viewBox="0 0 40 14" aria-hidden>
                    <polyline
                      points="0,7 6,7 10,7 13,1 16,13 19,7 24,7 27,1 30,13 33,7 37,7 40,7"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className={styles.logoSub}>BODY <span className={styles.logoDot}>&bull;</span> SPRUT</span>
                </span>
              </span>
            </Link>
          </div>
          <div className={styles.navRight}>
            <NavLink
              to={ROUTES.DATASETS}
              className={({ isActive }) => (isActive ? `${styles.link} ${styles.linkActive}` : styles.link)}
            >
              Датасеты
            </NavLink>
            <span className={styles.navDivider} aria-hidden />
            <NavLink
              to={ROUTES.HOME}
              className={({ isActive }) => (isActive ? `${styles.link} ${styles.linkActive}` : styles.link)}
              end
            >
              Личный кабинет
            </NavLink>
          </div>
        </nav>
      </header>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
