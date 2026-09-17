import { NavLink } from "react-router-dom";
import styles from "./Sidebar.module.css";
function Sidebar({items, title="Center for Entrepreneurship, Training and Placement (CETP)"}) {

    return (
        <aside className = {styles.sidebar}>
            <div className={styles.sidebarHeader}>
                <h2>{title}</h2>
            </div>
            <nav className={styles.sidebarNav}>
                {items.map((item) => (
                    <NavLink 
                    key = {item.path}
                    to = {item.path}
                    className={({isActive}) => `${styles.navItem} ${isActive ? styles.active : ""}`}

                    >
                        {item.label}
                    </NavLink> 
                ))}

            </nav>


        </aside>
    );
}

export default Sidebar;