import styles from './Button.module.css';

function Button(
    {
        children,
        variant = "primary",
        onClick,
        type = "button",
        disabled = false,
    }
){
    return (
        <button type = {type} className={`${styles.button} ${styles[variant]}`} onClick={onClick} disabled={disabled}>
            {children}

        </button>

    );
}

export default Button;