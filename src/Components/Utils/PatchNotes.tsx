import { useContext } from 'react';
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

  return (
    <div className='patch-notes-container'>
      {sortedNotes.map((release) => (
        <div key={release.date} className='patch-date-card'>
          <h3 className='patch-date'>{release.date}</h3>
          <div className='patch-notes-list'>
            {release.patch_notes.map((note, index) => (
              <>
                <div className='patch-note-container' key={index}>
                  <h4 className='note-header'>{note.header}</h4>
                  <ul className='note-body'>
                    {note.body.map((point, idx) => (
                      <li key={idx} className='note-point'>
                        <p className='note-body-text'>{point}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default PatchNotes;
