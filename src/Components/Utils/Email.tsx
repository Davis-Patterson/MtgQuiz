import { useContext, useState, useEffect } from 'react';
import { AppContext } from 'Contexts/AppContext';
import emailjs from '@emailjs/browser';
import LinearProgress from '@mui/material/LinearProgress';
import 'Styles/Utils/Email.css';

function Email() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('No Context');
  }
  const { setSettingsWindow } = context;

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    message: '',
  });

  const [messageButtonActive, setMessageButtonActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setForm((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!import.meta.env.VITE_EMAILJS_USER_ID) {
      setError('Email user configuration error - please try again later');
      setIsLoading(false);
      setSending(false);
      return;
    }
    if (!import.meta.env.VITE_EMAILJS_TEMPLATE_ID) {
      setError('Email template configuration error - please try again later');
      setIsLoading(false);
      setSending(false);
      return;
    }
    if (!import.meta.env.VITE_EMAILJS_SERVICE_ID) {
      setError('Email service configuration error - please try again later');
      setIsLoading(false);
      setSending(false);
      return;
    }

    setSending(true);
    setIsLoading(true);

    try {
      const templateParams = {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        message: form.message,
      };

      const response = await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        templateParams,
        import.meta.env.VITE_EMAILJS_USER_ID
      );

      setSuccess(true);
      console.log('Emails successfully sent!', response);
      setTimeout(() => {
        setForm({
          firstName: '',
          lastName: '',
          email: '',
          message: '',
        });
        setSettingsWindow('settings');
        setSuccess(false);
      }, 3000);
    } catch (error) {
      let errorMessage = 'Unknown error occurred';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      setError(errorMessage);
      console.error('Email send failed:', error);
    } finally {
      setSending(false);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log('EmailJS Config:', {
      service: import.meta.env.VITE_EMAILJS_SERVICE_ID,
      template: import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
      user: import.meta.env.VITE_EMAILJS_USER_ID,
    });
  }, []);

  useEffect(() => {
    const isMessageFormEmpty =
      !form.firstName.trim() || !form.email.trim() || !form.message.trim();

    setMessageButtonActive(!isMessageFormEmpty);
  }, [form.firstName, form.email, form.message]);

  return (
    <form onSubmit={handleSubmit}>
      <div className='email-name-inputs'>
        <input
          type='text'
          name='firstName'
          value={form.firstName}
          onChange={handleChange}
          required
          placeholder='First Name*'
          className='email-name-input'
        />
        <input
          type='text'
          name='lastName'
          value={form.lastName}
          onChange={handleChange}
          placeholder='Last Name'
          className='email-name-input'
        />
      </div>
      <div>
        <input
          type='text'
          name='email'
          value={form.email}
          onChange={handleChange}
          required
          placeholder='Email*'
          className='email-input'
        />
      </div>
      <div>
        <textarea
          name='message'
          value={form.message}
          maxLength={1200}
          onChange={handleChange}
          placeholder='Message*'
          className='email-message-input'
        />
      </div>
      {!messageButtonActive && <p className='email-required'>*required</p>}
      {error && !sending && <p className='error'>{error}</p>}
      {sending && <p className='email-text'>Sending your email...</p>}
      {!sending && success && <div className='success'>Success!</div>}
      {sending ? (
        <div className='guess-button orange-glow'>
          <LinearProgress color='inherit' className='linear-progress' />
        </div>
      ) : success ? (
        <div className='guess-button orange-glow'>Send Message</div>
      ) : error ? (
        <div className='guess-button orange-glow'>Send Message</div>
      ) : (
        <button
          type='submit'
          className={`${
            messageButtonActive ? 'guess-button orange-glow' : 'inactive-button'
          }`}
          disabled={!messageButtonActive}
        >
          {isLoading ? (
            <LinearProgress color='inherit' className='linear-progress' />
          ) : (
            'Send Message'
          )}
        </button>
      )}
    </form>
  );
}

export default Email;
