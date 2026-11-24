import Input from "../common/Input";
import Button from "../common/Button";
import styles from "./RoundsEditor.module.css";

function RoundsEditor({ rounds, onChange }) {
    function updateRound(index, value) {
        const next = [...rounds];
        next[index] = value;
        onChange(next);
    }

    function addRound() {
        if (rounds.length >= 10) return;
        onChange([...rounds, ""]);
    }

    function removeRound(index) {
        onChange(rounds.filter((_, i) => i !== index));
    }

    function moveRound(index, direction) {
        const newIndex = index + direction;
        if (newIndex < 0 || newIndex >= rounds.length) return;
        const next = [...rounds];
        [next[index], next[newIndex]] = [next[newIndex], next[index]];
        onChange(next);
    }

    return (
        <div className={styles.wrapper}>
            <label className={styles.label}>
                Hiring Rounds (optional — leave empty for a single default "Interview" round)
            </label>

            {rounds.map((round, index) => (
                <div key={index} className={styles.row}>
                    <span className={styles.order}>{index + 1}</span>
                    <Input
                        id={`round-${index}`}
                        value={round}
                        onChange={(e) => updateRound(index, e.target.value)}
                        placeholder={`Round ${index + 1} name, e.g. Aptitude`}
                    />
                    <Button
                        type="button"
                        variant="outline"
                        disabled={index === 0}
                        onClick={() => moveRound(index, -1)}
                    >
                        ↑
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        disabled={index === rounds.length - 1}
                        onClick={() => moveRound(index, 1)}
                    >
                        ↓
                    </Button>
                    <Button type="button" variant="danger" onClick={() => removeRound(index)}>
                        Remove
                    </Button>
                </div>
            ))}

            <Button type="button" variant="outline" disabled={rounds.length >= 10} onClick={addRound}>
                + Add Round
            </Button>
        </div>
    );
}

export default RoundsEditor;