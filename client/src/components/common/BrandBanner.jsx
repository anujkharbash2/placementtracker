import styles from "./BrandBanner.module.css";
import sauLogo from "../../assets/images/logos/sau-logo.png";
import saarcLogo from "../../assets/images/logos/saarc-logo.png";

import afghanistan from "../../assets/images/flags/afghanistan.png";
import bangladesh from "../../assets/images/flags/bangladesh.png";
import bhutan from "../../assets/images/flags/bhutan.png";
import india from "../../assets/images/flags/india.png";
import maldives from "../../assets/images/flags/maldives.png";
import nepal from "../../assets/images/flags/nepal.png";
import pakistan from "../../assets/images/flags/pakistan.png";
import sriLanka from "../../assets/images/flags/srilanka.png";

const flags = [
    { name: "Afghanistan", src: afghanistan },
    { name: "Bangladesh", src: bangladesh },
    { name: "Bhutan", src: bhutan },
    { name: "India", src: india },
    { name: "Maldives", src: maldives },
    { name: "Nepal", src: nepal },
    { name: "Pakistan", src: pakistan },
    { name: "Sri Lanka", src: sriLanka },
];

function BrandBanner() {
    return (
        <div className={styles.banner}>
            <img src={sauLogo} alt="South Asian University" className={styles.logo} />

            <div className={styles.flagRow}>
                {flags.map((flag) => (
                    <img
                        key={flag.name}
                        src={flag.src}
                        alt={flag.name}
                        title={flag.name}
                        className={styles.flag}
                    />
                ))}
            </div>

            <img src={saarcLogo} alt="SAARC" className={styles.logo} />
        </div>
    );
}

export default BrandBanner;