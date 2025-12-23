user: 

db/: Add nullable messages.chunksEncrypted, and .chunksIv, as bytea columns.

data/: The chunks fields encrypts/decrypts to a string that is a  JSON array of chunks from the chat completion. Update to persist all chunks in order. Don't bother persisting .text when chunks is present.

ui/: Update MessageCard to get the needed data from the chunks instead. Add a data/ helper file to extract the data out of the chunks on the fly.

Then, remove the unneeded `messages` columns that can be dropped from the messages table. Make the .text columns nullable.