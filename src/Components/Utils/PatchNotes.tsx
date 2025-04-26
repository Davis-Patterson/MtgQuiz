import { useContext, useState } from 'react';
import { AppContext } from 'Contexts/AppContext';
import PatchNotesData from 'Utilities/PatchNotes.json';
import 'Styles/Utils/PatchNotes.css';

function PatchNotes() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('No Context');
  }

  const sortedNotes = [...PatchNotesData].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const [selectedDate, setSelectedDate] = useState<string>(
    sortedNotes[0]?.date || 'all'
  );

  const handleDateChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDate(event.target.value);
  };

  const filteredNotes =
    selectedDate === 'all'
      ? sortedNotes
      : sortedNotes.filter((note) => note.date === selectedDate);

  return (
    <div className='patch-notes-container'>
      <div className='patch-notes-header'>
        <select
          className='patch-date-selector'
          value={selectedDate}
          onChange={handleDateChange}
        >
          <option value='all'>All Updates</option>
          {sortedNotes.map((release) => (
            <option key={release.date} value={release.date}>
              {release.date}
            </option>
          ))}
        </select>
      </div>

      {filteredNotes.map((release) => (
        <div key={release.date} className='patch-date-card'>
          {selectedDate === 'all' && (
            <h3 className='patch-date'>{release.date}</h3>
          )}
          <div className='patch-notes-list'>
            {release.patch_notes.map((note, index) => (
              <div className='patch-note-container' key={index}>
                <div className='note-header-container'>
                  <h4 className='note-header'>{note.header}</h4>
                </div>
                <ul className='note-body'>
                  {note.body.map((point, idx) => (
                    <li key={idx} className='note-point'>
                      <p className='note-body-text'>{point}</p>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default PatchNotes;
