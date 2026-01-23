import React from 'react';
import styles from './PageLayout.module.css';

interface PageLayoutProps {
  title: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

const PageLayout: React.FC<PageLayoutProps> = ({ title, children, actions }) => {
  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>{title}</h1>
        {actions && <div className={styles.actions}>{actions}</div>}
      </div>
      <div className={styles.pageContent}>{children}</div>
    </div>
  );
};

export default PageLayout;
