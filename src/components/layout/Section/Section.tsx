import React from 'react';
import { IoArrowForward } from 'react-icons/io5';
import styles from './Section.module.css';

interface SectionProps {
  title: string;
  children: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const Section: React.FC<SectionProps> = ({ title, children, action }) => {
  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>{title}</h2>
        {action && (
          <button onClick={action.onClick} className={styles.seeAllButton}>
            {action.label}
            <IoArrowForward size={16} />
          </button>
        )}
      </div>
      {children}
    </section>
  );
};

export default Section;
