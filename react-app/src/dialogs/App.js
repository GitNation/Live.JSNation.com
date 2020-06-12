import React from 'react';
import { Dialog, DialogOverlay, DialogContent } from '@reach/dialog';
import '@reach/dialog/styles.css';
import styled, { createGlobalStyle } from 'styled-components';

import DialogPopup from './DialogPopup';
import { getEventStatus } from './model';
import NewTab from './NewTab';
import TicketMessage from './TicketMessage';

const eventNames = [
  'video-room',
  'qa-room',
  'speaker-room',
  'discussion-room',
  'any-room',
  'link',
];

const GlobalStyle = createGlobalStyle`
  [data-reach-dialog-overlay] {
    background-color: ${({ isOpen }) =>
      isOpen ? 'hsla(0, 0%, 0%, 0.85)' : 'hsla(0, 0%, 0%, 0.4)'};
    transition: background-color 500ms ease;
    z-index: 10;
  }

  [data-reach-dialog-content] {
    padding: 0;
  }

`;

const navOutside = (link) => {
  const a = document.createElement('a');
  a.href = link;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

const useBusEvents = (bus) => {
  const [isOpen, setOpen] = React.useState(false);
  const [type, setType] = React.useState(null);
  const [content, setContent] = React.useState(null);

  const close = () => setOpen(false);

  const getDetails = (content) => {
    const status = content ? getEventStatus(content) : null;
    const isNow = status && status.status === 'now';
    const eventIsAuth = content && content.isAuth;
    const isAuth = eventIsAuth !== null ? eventIsAuth : bus.content.isAuth;

    return {
      status: status && status.status,
      isNow,
      isAuth,
    };
  };

  const onEvent = ({ type, payload }) => {
    if (type === 'click' && eventNames.includes(payload.name)) {
      setType(payload.name);
      setContent(payload);

      const { status, isAuth } = getDetails(payload);

      /* if link is available just click it */
      if ((!status || status === 'now') && isAuth) {
        navOutside(payload.link);
      } else {
        setOpen(true);
      }
    }
  };

  React.useEffect(() => {
    bus.subscribe(onEvent);
    const unsubscribe = () => {
      /* do nothing as this app is not going to by unmounted */
    };
    return unsubscribe;
  }, []);

  const { status, isAuth, isNow } = getDetails(content);

  return {
    isOpen,
    type,
    close,
    content,
    status,
    isNow,
    isAuth,
  };
};

const App = ({ bus }) => {
  const { isOpen, close, type, content, status, isAuth } = useBusEvents(bus);

  if (!content || !isOpen) {
    return null;
  }

  if (!isAuth && status !== 'archived') {
    /* not Auth users always see tickets message */
    return (
      <DialogOverlay isOpen={isOpen} onDismiss={close}>
        <GlobalStyle isOpen={isOpen} />
        <DialogContent aria-label="this activity is not available">
          {isOpen ? <TicketMessage /> : null}
        </DialogContent>
      </DialogOverlay>
    );
  }

  /* Auth users if not followed the link will see the popup with explanation */
  return (
    <DialogOverlay isOpen={isOpen} onDismiss={close}>
      <GlobalStyle isOpen={isOpen} />
      <DialogContent aria-label="this activity is not available">
        {isOpen ? (
          <DialogPopup type={type} content={content} status={status} />
        ) : null}
      </DialogContent>
    </DialogOverlay>
  );
};

export default App;
