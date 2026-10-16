import { ageBetween, ageToday, formatDate } from '../../lib/dates.js';
import WikiText from '../wikitext/WikiText.jsx';

function Row({ label, children }) {
  return (
    <tr>
      <th scope="row" className="infobox-label">
        {label}
      </th>
      <td className="infobox-data">{children}</td>
    </tr>
  );
}

/** Biography infobox (PROJECT_SPEC §4.3, FRONTEND_PLAN §5.6). */
export default function Infobox({ infobox, title, now }) {
  if (!infobox) return null;
  const { image, birthDate, birthPlace, deathDate, deathPlace, fields = [] } = infobox;
  const name = infobox.name?.trim() || title;
  const alive = !deathDate;
  const age = alive ? ageToday(birthDate, now) : null;
  const ageAtDeath = deathDate ? ageBetween(birthDate, deathDate) : null;
  const visibleFields = fields.filter((f) => f.label?.trim() && f.value?.trim());
  const hasBorn = birthDate || birthPlace;
  const hasDied = deathDate || deathPlace;

  if (!name && !image?.url && !hasBorn && !hasDied && visibleFields.length === 0) return null;

  return (
    <table className="infobox">
      <tbody>
        {name && (
          <tr>
            <th colSpan={2} className="infobox-above">
              {name}
            </th>
          </tr>
        )}
        {image?.url && (
          <tr>
            <td colSpan={2} className="infobox-image">
              <img src={image.url} alt={image.alt || ''} />
              {image.caption && (
                <div className="infobox-caption">
                  <WikiText source={image.caption} inline />
                </div>
              )}
            </td>
          </tr>
        )}
        {hasBorn && (
          <Row label="Born">
            {birthDate && formatDate(birthDate)}
            {age !== null && ` (age ${age})`}
            {birthDate && birthPlace && <br />}
            {birthPlace && <WikiText source={birthPlace} inline />}
          </Row>
        )}
        {hasDied && (
          <Row label="Died">
            {deathDate && formatDate(deathDate)}
            {ageAtDeath !== null && ` (aged ${ageAtDeath})`}
            {deathDate && deathPlace && <br />}
            {deathPlace && <WikiText source={deathPlace} inline />}
          </Row>
        )}
        {visibleFields.map((f, i) => (
          <Row key={i} label={f.label}>
            <WikiText source={f.value} inline lineBreaks />
          </Row>
        ))}
      </tbody>
    </table>
  );
}
