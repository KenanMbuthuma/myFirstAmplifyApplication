import './App.css';
import { createNote, deleteNote } from './graphql/mutations';
import { listNotes } from './graphql/queries';
import { withAuthenticator, Button, Text, Flex, Heading } from "@aws-amplify/ui-react";
import { useCallback, useEffect, useState } from 'react';
import { generateClient } from 'aws-amplify/api';

function App({ signOut }) {
  const [notes, setNotes] = useState([]);

  const fetchNotes = useCallback(async () => {
    try {
      const client = generateClient({ authMode: 'AMAZON_COGNITO_USER_POOLS' });
      const result = await client.query({ query: listNotes });
      setNotes(result.data.listNotes.items);
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  }, []);

  const handleCreateNote = useCallback(async () => {
    try {
      const client = generateClient({ authMode: 'AMAZON_COGNITO_USER_POOLS' });
      await client.mutate({ mutation: createNote, variables: { input: { text: window.prompt("New note") } } });
      fetchNotes();
    } catch (error) {
      console.error('Error creating note:', error);
    }
  }, [fetchNotes]);

  const handleDeleteNote = useCallback(async (id) => {
    try {
      const client = generateClient({ authMode: 'AMAZON_COGNITO_USER_POOLS' });
      await client.mutate({ mutation: deleteNote, variables: { input: { id: id } } });
      fetchNotes();
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  }, [fetchNotes]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  return (
    <Flex direction={"column"}>
      <Flex justifyContent={'space-between'}>
        <Heading level={1}>My notes</Heading>
        <Button onClick={signOut}>Sign Out</Button>
      </Flex>
      {notes.map(note => <Flex alignItems={'center'} key={note.id}>
        <Text>{note.text}</Text>
        <Button onClick={() => handleDeleteNote(note.id)}>Remove</Button>
      </Flex>)}
      <Button onClick={handleCreateNote}>Add Note</Button>
    </Flex>
  );
}

export default withAuthenticator(App);
