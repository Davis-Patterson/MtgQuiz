import { useContext, useState } from 'react';
import { AppContext, Player } from 'Contexts/AppContext';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import DragIcon from 'Svgs/DragIcon';
import TrashIcon from 'Svgs/TrashIcon';
import CheckIcon from 'Svgs/CheckIcon';
import 'Styles/Utils/SortablePlayer.css';

const SortablePlayer = ({ player }: { player: Player }) => {
  const appContext = useContext(AppContext);
  if (!appContext) {
    throw new Error('No Context');
  }
  const { players, setPlayers } = appContext;

  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: player.id,
    });

  const [confirmDelete, setConfirmDelete] = useState(false);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleConfirmDelete = () => {
    setConfirmDelete(true);

    setTimeout(() => {
      setConfirmDelete(false);
    }, 2000);
  };

  const removePlayer = (orderToRemove: number) => {
    if (players.length > 1) {
      setPlayers((prev: Player[]) => {
        const filtered = prev.filter((p: Player) => p.order !== orderToRemove);
        return filtered.map((player: Player, index: number) => ({
          ...player,
          order: index + 1,
        }));
      });
    }
  };

  const handleNameChange = (order: number, newName: string) => {
    setPlayers((prev) =>
      prev.map((p) => (p.order === order ? { ...p, name: newName } : p))
    );
  };

  return (
    <div ref={setNodeRef} style={style} className='participant-item'>
      <p className='participant-order'>{player.order}</p>
      <input
        type='text'
        value={player.name}
        onChange={(e) => handleNameChange(player.order, e.target.value)}
        placeholder={`Player ${player.order}`}
        className='participant-name-input'
      />
      <div className='participant-controls'>
        {players.length <= 1 ? (
          <div
            className='drag-container-inactive'
            {...attributes}
            {...listeners}
          >
            <DragIcon className='drag-icon-inactive' />
          </div>
        ) : (
          <div className='drag-container' {...attributes} {...listeners}>
            <DragIcon className='drag-icon' />
          </div>
        )}
        <div className='trash-container'>
          {players.length <= 1 ? (
            <TrashIcon className='trash-inactive' />
          ) : confirmDelete ? (
            <CheckIcon
              className='check-icon'
              onClick={() => removePlayer(player.order)}
            />
          ) : (
            <TrashIcon
              className='trash-icon'
              onClick={() => handleConfirmDelete()}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default SortablePlayer;
