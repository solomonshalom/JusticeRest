// Those sweet writer links for them to share it to the world <3

/** @jsxImportSource @emotion/react */
import React, { useEffect, useState, useCallback } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { css } from '@emotion/react'
import tinykeys from 'tinykeys'
import StarterKit from '@tiptap/starter-kit'
import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { useDocumentData } from 'react-firebase-hooks/firestore'
import { NextPage } from 'next'
import Text from '@tiptap/extension-text'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Placeholder from '@tiptap/extension-placeholder'
import Highlight from '@tiptap/extension-highlight'
import * as Dialog from '@radix-ui/react-dialog'
import {
  ArrowLeftIcon,
  Cross2Icon,
  DotsVerticalIcon,
  FontBoldIcon,
  FontItalicIcon,
  Link2Icon,
  LinkBreak2Icon,
  StrikethroughIcon,
  Pencil1Icon
} from '@radix-ui/react-icons'
import firebase, { auth, firestore } from '../../lib/firebase'
import { postWithUserIDAndSlugExists, removePostForUser, updatePostCategory } from '../../lib/db'
import Input from '../../components/input'
import Spinner from '../../components/spinner'
import Container from '../../components/container'
import ModalOverlay from '../../components/modal-overlay'
import PostContainer from '../../components/post-container'
import Button, { IconButton, LinkIconButton } from '../../components/button'

interface StyledLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode;
}

const StyledLabel: React.FC<StyledLabelProps> = ({ children, ...props }) => (
  <label
    css={css`
      display: block;
      margin-bottom: 0.5rem;
      font-size: 0.9rem;
      color: var(--grey-3);
    `}
    {...props}
  >
    {children}
  </label>
);


interface SelectionMenuProps {
  editor: ReturnType<typeof useEditor> | null;
}

function SelectionMenu({ editor }: SelectionMenuProps) {
  const [editingLink, setEditingLink] = useState<boolean>(false)
  const [url, setUrl] = useState<string>('')

  if (!editor) {
    return null;
  }

  return (
    <BubbleMenu
      editor={editor}
      css={css`
        display: flex;
        align-items: center;

        border-radius: 0.5rem;
        box-shadow: 0 1rem 1rem var(--grey-1);
        background: var(--grey-5);
        color: var(--grey-1);
        padding: 0.5rem;

        input {
          background: none;
          border: none;
          margin: 0;
          padding: 0.5rem;
          color: var(--grey-2);
          font-family: 'Inter', sans-serif;
          font-size: 0.8rem;
        }

        input::placeholder {
          font-family: 'Inter', sans-serif;
          color: var(--grey-3);
          font-size: 0.8rem;
        }

        input:focus {
          outline: none;
        }

        button {
          margin: 0 0.5rem;
          background: none;
          border: none;
          width: 1rem;
          height: 1rem;
          color: var(--grey-3);
        }

        button:focus,
        button.is-active {
          color: var(--grey-1);
        }

        html[data-theme='dark'] {
          button:hover {
            background: rgba(255, 255, 255, 0.1);
          }
        }

        html[data-theme='dark'] {
          button:hover {
            background: rgba(0, 0, 0, 0.1);
          }
        }
      `}
    >
      {editingLink ? (
        <>
          <button
            onClick={() => {
              setEditingLink(false)
            }}
          >
            <ArrowLeftIcon />
          </button>
          <form
            onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
              e.preventDefault()

              editor
                .chain()
                .focus()
                .extendMarkRange('link')
                .setLink({ href: url })
                .run()

              setEditingLink(false)
            }}
          >
            <input
              type="url"
              value={url}
              placeholder="https://example.com"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setUrl(e.target.value)
              }}
            />
          </form>
          <button type="submit">
            <Link2Icon />
          </button>
        </>
      ) : (
        <>
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={editor.isActive('bold') ? 'is-active' : ''}
          >
            <FontBoldIcon />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={editor.isActive('italic') ? 'is-active' : ''}
          >
            <FontItalicIcon />
          </button>

          {/* Gotta fix; Showing Yellow instead of Purple
          <button
            onClick={() => editor.chain().focus().toggleHighlight({ color: '#7628AD' }).run()}
            className={editor.isActive('highlight', { color: '#7628AD' }) ? 'is-active' : ''}
          >

           <Pencil1Icon />
           </button>
           */}

          <button
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={editor.isActive('strike') ? 'is-active' : ''}
          >
            <StrikethroughIcon />
          </button>
          {editor.isActive('link') ? (
            <button onClick={() => editor.chain().focus().unsetLink().run()}>
              <LinkBreak2Icon />
            </button>
          ) : (
            <button
              onClick={() => {
                setEditingLink(true)
              }}
            >
              <Link2Icon />
            </button>
          )}
        </>
      )}
    </BubbleMenu>
  )
}

interface Post {
  id: string;
  title: string;
  content: string;
  slug: string;
  excerpt: string;
  published: boolean;
  category: string;
  author: string;
  lastEdited: firebase.firestore.Timestamp;
}

interface EditorProps {
  post: Post;
}

function Editor({ post }: EditorProps) {
  const [userdata] = useDocumentData<{ name: string }>(firestore.doc(`users/${post.author}`), {
    idField: 'id',
  })
  const [clientPost, setClientPost] = useState<Post>({
    ...post,
    title: '',
    content: '',
    slug: '',
    excerpt: '',
    published: true,
    category: '',
  });

  // Function to handle category change
  const handleCategoryChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCategory = e.target.value;
    setClientPost((prevPost) => ({
      ...prevPost,
      category: newCategory,
    }));
    await updatePostCategory(post.id, newCategory);
  };

  const [slugErr, setSlugErr] = useState<boolean>(false)

  useEffect(() => {
    setClientPost(post)
  }, [post])

  const saveChanges = useCallback(async () => {
    const toSave: Partial<Post> = {
      ...clientPost,
      lastEdited: firebase.firestore.Timestamp.now(),
    };
    delete toSave.id; // since we get the id from the document not the data
    await firestore.collection('posts').doc(post.id).set(toSave);
  }, [clientPost, post.id]);

  useEffect(() => {
    const unsubscribe = tinykeys(window, {
      '$mod+KeyS': (e: KeyboardEvent) => {
        e.preventDefault()
        saveChanges()
      },
    })

    return () => {
      unsubscribe()
    }
  }, [saveChanges])

  const ParagraphDocument = Document.extend({ content: 'paragraph' })

  const titleEditor = useEditor({
    content: post.title,
    extensions: [
      ParagraphDocument,
      Paragraph,
      Text,
      Placeholder.configure({
        placeholder: "Your post's title...",
      }),
    ],
    onUpdate: ({ editor: newEditor }) => {
      setClientPost(prevPost => ({
        ...prevPost,
        title: newEditor.getHTML().slice(3, -4),
      }))
    },
  })

  const excerptEditor = useEditor({
    content: post.excerpt,
    extensions: [
      ParagraphDocument,
      Paragraph,
      Text,
      Placeholder.configure({
        placeholder: 'A short excerpt describing your post...',
      }),
    ],
    onUpdate: ({ editor: newEditor }) => {
      setClientPost(prevPost => ({
        ...prevPost,
        excerpt: newEditor.getHTML().slice(3, -4),
      }))
    },
  })

  const contentEditor = useEditor({
    content: post.content,
    autofocus: 'end',
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Link,
      Image,
      Placeholder,
      Highlight.configure({ multicolor: true }), // Add the Highlight extension
    ],
    onUpdate: ({ editor: newEditor }) => {
      setClientPost(prevPost => ({ ...prevPost, content: newEditor.getHTML() }))
    },
  });

  function addImage() {
    const url = window.prompt('URL')

    if (url && contentEditor) {
      contentEditor.chain().focus().setImage({ src: url }).run()
    }
  }

  return (
    <>
      <Head>
        <title>
          {clientPost.title
            ? `Editing post: ${clientPost.title} / JusticeRest`
            : 'Editing...'}
        </title>
        <link rel="manifest" href="https://www.justice.rest/justicerest.webmanifest" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Newsreader:ital,wght@0,400;0,600;1,400;1,600&display=swap"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono&display=swap"
        />
      </Head>

      <header
        css={css`
          display: flex;
          align-items: center;

          button:first-of-type {
            margin-left: auto;
          }

          button:last-child {
            margin-left: 1rem;
          }
        `}
      >
        <LinkIconButton href="/dashboard">
          <ArrowLeftIcon />
        </LinkIconButton>
        <Button
          css={css`
            margin-left: auto;
            margin-right: 1rem;
            font-size: 0.9rem;
          `}
          outline
          disabled={
            post.title === clientPost.title &&
            post.content === clientPost.content &&
            post.excerpt === clientPost.excerpt &&
            post.category === clientPost.category
          }
          onClick={saveChanges}
        >
          Save changes
        </Button>

        <Dialog.Root>
          <Dialog.Trigger as={IconButton}>
            <DotsVerticalIcon />
          </Dialog.Trigger>

          <ModalOverlay />

          <Dialog.Content
            css={css`
              background: var(--grey-1);
              border-radius: 0.5rem;
              padding: 1.5rem;
              position: fixed;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
            `}
          >
            <Dialog.Title>Post Settings</Dialog.Title>
            <Dialog.Description
              css={css`
                margin: 1rem 0 0.5rem 0;
                max-width: 20rem;
                color: var(--grey-3);
                font-size: 0.9rem;
              `}
            >
              Make changes to your post&apos;s metadata.
            </Dialog.Description>
            <div
              css={css`
                margin: 1.5rem 0;
              `}
            >
              {/* Slug Is Seen Here */}
              <form>
                <label
                  htmlFor="post-slug"
                  css={css`
                    display: block;
                    margin-bottom: 0.5rem;
                  `}
                >
                  Slug
                </label>
                <div
                  css={css`
                    display: flex;
                    align-items: center;
                  `}
                >
                  <div>
                    <Input
                      type="text"
                      id="post-slug"
                      value={clientPost.slug}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setSlugErr(false)
                        setClientPost(prevPost => ({
                          ...prevPost,
                          slug: e.target.value,
                        }))
                      }}
                    />
                    {slugErr && (
                      <p
                        css={css`
                          margin-top: 1rem;
                          font-size: 0.9rem;
                        `}
                      >
                        Invalid slug. That slug is already in use or contains
                        special characters.
                      </p>
                    )}
                  </div>
                  <IconButton
                    type="submit"
                    disabled={clientPost.slug === post.slug || !clientPost.slug}
                    onClick={async (e: React.MouseEvent<HTMLButtonElement>) => {
                      e.preventDefault()

                      const slugClashing = await postWithUserIDAndSlugExists(
                        post.author,
                        clientPost.slug,
                      )

                      if (
                        slugClashing ||
                        !clientPost.slug.match(/^[a-z0-9-]+$/i)
                      ) {
                        setSlugErr(true)
                        return
                      }

                      const postCopy = { ...post }
                      delete postCopy.id
                      postCopy.slug = clientPost.slug
                      await firestore
                        .collection('posts')
                        .doc(post.id)
                        .update(postCopy)
                      setSlugErr(false)
                    }}
                  >
                    ✔
                  </IconButton>
                </div>
              </form>
            </div>

            <div>
              <StyledLabel htmlFor="profile-category">Category</StyledLabel>
              <select
                css={css`
                  text-transform: none;
                  display: block;
                  width: 17em;
                  padding: 0.75em 1.5em;
                  background: none;
                  border: 1px solid var(--grey-2);
                  outline: none;
                  border-radius: 0.5rem;
                  color: inherit;
                  margin-bottom: 1.5em;
                  background-color: var(--grey-1)
                `}
                id="profile-category"
                value={clientPost.category}
                onChange={handleCategoryChange}
              >
                <option value="">Type of Concern</option>
                <option value="Social">Social</option>
                <option value="Economic">Economic</option>
                <option value="Political">Political</option>
                <option value="Corporate">Corporate</option>
                <option value="Others">Others</option>
              </select>
            </div>

            <div
              css={css`
                display: flex;

                button {
                  margin-left: 0;
                  margin-right: 1rem;
                }

                button:last-child {
                  margin-right: auto;
                }

                button {
                  font-size: 0.9rem;
                }
              `}
            >
              <Button
                onClick={async () => {
                  await firestore
                    .collection('posts')
                    .doc(post.id)
                    .update({ published: !post.published })
                }}
              >
                {post.published ? 'Make Draft' : 'Publish'}
              </Button>
              <Button
                outline
                onClick={async () => {
                  await removePostForUser(post.author, post.id)
                  router.push('/dashboard')
                }}
              >
                Delete
              </Button>
            </div>

            {post.published && userdata ? (
              <p
                css={css`
                  margin: 1.5rem 0 0 0;
                  font-size: 0.9rem;
                  max-width: 15rem;
                  word-wrap: break-word;

                  a {
                    text-decoration: none;
                    color: inherit;
                    font-style: italic;
                    border-bottom: 1px dotted var(--grey-3);
                  }
                `}
              >
                See your post live at:{' '}
                <a
                  target="_blank"
                  rel="noreferrer"
                  href={`/${userdata.name}/${post.slug}`}
                >
                  justice.rest/{userdata.name}/{post.slug}
                </a>
              </p>
            ) : null}

            <Dialog.Close
              as={IconButton}
              css={css`
                position: absolute;
                top: 1rem;
                right: 1rem;
              `}
            >
              <Cross2Icon />
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Root>
      </header>

      <Button
        outline
        css={css`
          font-size: 0.9rem;
          margin-top: 5rem;
          margin-bottom: 2.5rem;
        `}
        onClick={addImage}
      >
        + Image
      </Button>

      <div
        css={css`
          font-size: 1.5rem;
          font-weight: 500;
        `}
      >
        <EditorContent editor={titleEditor} />
      </div>

      <div
        css={css`
          margin: 1.5rem 0;
          font-size: 1.15rem;
          font-weight: 500;
          color: var(--grey-4);
        `}
      >
        <EditorContent editor={excerptEditor} />
      </div>

      <PostContainer
        css={css`
          .ProseMirror-focused {
            outline: none;
          }

          margin-bottom: 5rem;
        `}
      >
        {contentEditor && <SelectionMenu editor={contentEditor} />}
        <EditorContent editor={contentEditor} />
      </PostContainer>
    </>
  )
}

const PostEditor: NextPage = () => {
  const router = useRouter();
  const [user, userLoading, userError] = useAuthState(auth);
  const [post, postLoading, postError] = useDocumentData<Post | undefined>(
    router.query.pid ? firestore.doc(`posts/${router.query.pid}`) : null,
    {
      idField: 'id',
    }
  );

  useEffect(() => {
    if (!userLoading && !user) {
      router.push('/');
    } else if (!postLoading && !post) {
      router.push('/dashboard');
    }
  }, [router, user, userLoading, post, postLoading]);

  if (userError || postError) {
    return (
      <>
        <p>Oops, we&apos;ve had an error:</p>
        <pre>{JSON.stringify(userError || postError)}</pre>
      </>
    );
  }

  if (userLoading || postLoading) {
    return <Spinner />;
  }

  if (post) {
    return <Editor post={post} />;
  }

  return null;
};

PostEditor.getLayout = function PostEditorLayout(page: React.ReactElement) {
  return (
    <Container
      maxWidth="640px"
      css={css`
        margin-top: 5rem;
      `}
    >
      {page}
    </Container>
  );
};

export default PostEditor;
