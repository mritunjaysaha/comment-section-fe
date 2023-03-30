import { CommentBody } from './CommentBody';
import { CommentHeader } from './CommentHeader';
import { CommentScoreCounter } from './CommentScoreCounter';

import styles from './comment.module.scss';
import { useState } from 'react';
import { CommentTextArea } from './CommentTextArea';
import { useDispatch, useSelector } from 'react-redux';
import {
    addNestedReply,
    addReply,
    deleteComment,
    deleteCommentReply,
    updateLocalStorageComments,
} from '../../redux/slice/commentSlice';
import { useComment } from '../../hooks/useComment';

export function Comment({ data, isMyComment = false, isReply = false, parentId }) {
    const dispatch = useDispatch();

    const { content, score, user, createdAt, id } = data;
    const { currentUser } = useSelector((state) => state.comment);

    const [scoreCount, setScoreCount] = useState(score);
    const [canIncrease, setCanIncrease] = useState(true);
    const [canDecrease, setCanDecrease] = useState(true);
    const [isReplyClicked, setIsReplyClicked] = useState(false);
    const [isEditClicked, setIsEditClicked] = useState(false);

    const { commentValue, setCommentValue, handleTextAreaChange } = useComment();

    function handleIncreaseScore() {
        if (canIncrease) {
            setScoreCount((score) => (score += 1));
            setCanIncrease(!canIncrease);
            setCanDecrease(true);
        }
    }

    function handleDecreaseScore() {
        if (canDecrease) {
            setScoreCount((score) => (score -= 1));
            setCanDecrease(!canDecrease);
            setCanIncrease(true);
        }
    }

    function handleReplyClick() {
        setIsReplyClicked(!isReplyClicked);

        console.log('clicked');
    }

    function handleCommentReply(e) {
        e.preventDefault();

        const data = {
            id: Date.now(),
            content: commentValue,
            createdAt: 'today',
            score: 0,
            replyingTo: user.username,
            user: currentUser,
        };

        dispatch(addReply({ id, data }));

        setCommentValue('');
        setIsReplyClicked(false);

        dispatch(updateLocalStorageComments());
    }

    function handleNestedCommentReply() {
        const nestedReplyData = {
            id: Date.now(),
            content: commentValue,
            createdAt: 'today',
            score: 0,
            replyingTo: user.username,
            user: currentUser,
        };

        console.log({ nestedReplyData });

        setIsReplyClicked(false);
        setCommentValue('');

        dispatch(addNestedReply({ parentId, data: nestedReplyData }));

        dispatch(updateLocalStorageComments());
    }

    function handleCommentDelete() {
        dispatch(deleteComment(id));
        dispatch(updateLocalStorageComments());
    }

    function handleCommentReplyDelete() {
        dispatch(deleteCommentReply({ parentId, replyId: data.id }));
        dispatch(updateLocalStorageComments());
    }

    function handleDeleteClick() {
        if (!isReply) {
            handleCommentDelete();
        } else {
            handleCommentReplyDelete();
        }
    }

    function handleEditClick() {
        setCommentValue(content);

        setIsReplyClicked(true);
        handleDeleteClick();
    }

    return (
        <>
            <div className={styles.comment_container}>
                <CommentScoreCounter
                    score={scoreCount}
                    handleIncreaseScore={handleIncreaseScore}
                    handleDecreaseScore={handleDecreaseScore}
                />
                <div className={styles.comment_data}>
                    <CommentHeader
                        imgSrc={user.image.png}
                        username={user.username}
                        createdAt={createdAt}
                        isMyComment={isMyComment}
                        handleReplyClick={handleReplyClick}
                        handleDeleteClick={handleDeleteClick}
                        handleEditClick={handleEditClick}
                    />
                    <CommentBody content={content} />
                </div>
            </div>
            {isReplyClicked ? (
                <CommentTextArea
                    handleButtonClick={!isReply ? handleCommentReply : handleNestedCommentReply}
                    handleChange={handleTextAreaChange}
                    buttonText={!isEditClicked ? 'reply' : 'update'}
                    value={commentValue}
                />
            ) : (
                ''
            )}
        </>
    );
}
