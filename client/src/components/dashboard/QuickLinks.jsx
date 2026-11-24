import Button from "../common/Button";
import styles from "./Dashboard.module.css";

// links: [{ label, onClick, disabled?, tooltip? }]
function QuickLinks({ links }) {
    return (
        <div className={styles.quickLinks}>
            {links.map((link) => (
                <span key={link.label} title={link.disabled ? link.tooltip || "Coming soon" : undefined}>
                    <Button type="button" variant="outline" disabled={link.disabled} onClick={link.onClick}>
                        {link.label}
                    </Button>
                </span>
            ))}
        </div>
    );
}

export default QuickLinks;