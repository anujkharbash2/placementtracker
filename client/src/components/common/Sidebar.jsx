import styles from "./Sidebar.module.css";

function Sidebar({
    items,
    title = "Center for Entrepreneurship, Training and Placement (CETP)"
}) {
    return (
        <aside className={styles.sidebar}>

            <div className={styles.sidebarHeader}>
                <h2>{title}</h2>
            </div>

            <nav className={styles.sidebarNav}>
                {items.map((item) => (
                    <button
                        key={item.label}
                        onClick={item.onClick}
                        className={`${styles.navItem} ${
                            item.active ? styles.active : ""
                        }`}
                    >
                        {item.label}
                    </button>
                ))}
            </nav>

        </aside>
    );
}

export default Sidebar;