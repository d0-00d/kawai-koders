import { useState } from "react";
import TabNav from "../../components/TabNav/TabNav";
import Team from "../../tabs/Team/Team";
import MissionVision from "../../tabs/MissionVision/MissionVision";
import Policies from "../../tabs/Policies/Policies";
import MVP from "../../tabs/MVP/MVP";
import ContactForm from "../../tabs/ContactForm/ContactForm";
import styles from "./LandingPage.module.css";

const tabs = ["Team", "Mission & Vision", "Policies", "MVP", "Contact"];

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState<string>("Team");

  const renderActiveTab = () => {
    switch (activeTab) {
      case "Mission & Vision":
        return <MissionVision />;
      case "Policies":
        return <Policies />;
      case "MVP":
        return <MVP />;
      case "Contact":
        return <ContactForm />;
      default:
        return <Team />;
    }
  };

  return (
    <section className={styles.container}>
      <TabNav tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
      <div className={styles.tabContent}>{renderActiveTab()}</div>
    </section>
  );
}
