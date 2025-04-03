import { useContext, useState, useEffect, useRef } from 'react';
import { AppContext, Player } from 'Contexts/AppContext';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import EditIcon from 'Svgs/EditIcon';
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
  const [showEditNameInput, setShowEditNameInput] = useState(false);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  const handleEditName = () => {
    setShowEditNameInput(!showEditNameInput);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const handleNameChange = (order: number, newName: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setShowEditNameInput(false);
    }, 8000);

    setPlayers((prev) =>
      prev.map((p) => (p.order === order ? { ...p, name: newName } : p))
    );
  };

  useEffect(() => {
    if (showEditNameInput) {
      timeoutRef.current = setTimeout(() => {
        setShowEditNameInput(false);
      }, 8000);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [showEditNameInput, player.name]);

  return (
    <div ref={setNodeRef} style={style} className='participant-item'>
      <p className='participant-order'>{player.order}</p>
      {showEditNameInput ? (
        <input
          type='text'
          value={player.name}
          onChange={(e) => handleNameChange(player.order, e.target.value)}
          placeholder={`Player ${player.order}`}
          className='participant-name-input'
        />
      ) : (
        <div className='participant-name-display'>
          <p className='participant-name-display-text'>
            {player.name || `Player ${player.order}`}
          </p>
        </div>
      )}
      <div className='participant-controls'>
        <div className='participants-edit-icon-container'>
          {showEditNameInput ? (
            <CheckIcon
              className='participants-check-icon'
              onClick={() => handleEditName()}
            />
          ) : (
            <EditIcon
              className='participants-edit-icon'
              onClick={() => handleEditName()}
            />
          )}
        </div>
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
