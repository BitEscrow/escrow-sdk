export interface NoteTemplate {
  content    : string
  created_at : number
  kind       : number
  pubkey     : string
  tags       : string[][]
}

export interface SignedNote extends NoteTemplate {
  id  : string
  sig : string
}
