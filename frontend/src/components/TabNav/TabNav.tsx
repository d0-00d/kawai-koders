import styles from "./TabNav.module.css";

interface TabNavProps {
  tabs: string[];
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function TabNav({ tabs, activeTab, onTabChange }: TabNavProps) {
  return (
    <div className={styles.tabNav}>
      {tabs.map((tab) => (
        <button
          key={tab}
          type="button"
          className={tab === activeTab ? styles.activeTab : styles.tabButton}
          onClick={() => onTabChange(tab)}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
