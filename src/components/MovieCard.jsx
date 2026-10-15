// import { Button, Card, Rate, Typography } from 'antd';
// import {
//   PlusOutlined,
//   CheckOutlined,
// } from '@ant-design/icons';

// const { Text } = Typography;

// export default function MovieCard({
//   movie,
//   onAddToWatchlist,
//   isInWatchlist = false,
//   actionLoading = false,
// }) {
//   const poster =
//     movie.posterUrl ||
//     movie.image ||
//     '';

//   const rating = Number(movie.rating) || 0;

//   return (
//     <Card
//       className="movie-card"
//       cover={
//         poster ? (
//           <img
//             src={poster}
//             alt={`${movie.title} poster`}
//             className="movie-poster"
//             loading="lazy"
//           />
//         ) : (
//           <div className="movie-poster movie-poster-placeholder">
//             No poster available
//           </div>
//         )
//       }
//     >
//       <div className="movie-card-content">
//         <Typography.Title
//           level={5}
//           className="movie-title"
//         >
//           {movie.title || 'Untitled movie'}
//         </Typography.Title>

//         {movie.actors && (
//           <Text type="secondary">
//             {movie.actors}
//           </Text>
//         )}

//         <div className="movie-rating">
//           <Rate
//             disabled
//             allowHalf
//             value={Math.max(
//               0,
//               Math.min(5, rating / 2)
//             )}
//           />
//           <Text>{rating}/10</Text>
//         </div>

//         {onAddToWatchlist && (
//           <Button
//             block
//             icon={
//               isInWatchlist
//                 ? <CheckOutlined />
//                 : <PlusOutlined />
//             }
//             disabled={isInWatchlist}
//             loading={actionLoading}
//             onClick={() => onAddToWatchlist(movie)}
//           >
//             {isInWatchlist
//               ? 'In Watchlist'
//               : 'Add to Watchlist'}
//           </Button>
//         )}
//       </div>
//     </Card>
//   );
// }

//ant desin v1
import {
  Card,
  Switch,
  Typography,
  Tag,
  Button,
  Tooltip,
  Popconfirm,
} from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';

const { Title } = Typography;

const MovieCard = ({
  movie,
  isWatchlisted,
  toggleWatchlist,
  onEdit,
  onDelete,
}) => {
  const handleImageError = (event) => {
    event.currentTarget.onerror = null;
    event.currentTarget.src = '/images/default.jpg';
  };

  const getRatingColor = (rating) => {
    if (rating >= 8) return 'success';
    if (rating >= 5) return 'warning';
    return 'error';
  };

  return (
    <Card
      className="movie-card"
      cover={
        <img
          className="movie-poster"
          src={
            movie.posterUrl
              ? movie.posterUrl
              : movie.image
                ? `/images/${movie.image}`
                : `/images/${movie.id}.jpg`
          }
          alt={movie.title}
          onError={handleImageError}
        />
      }
    >
      <Title level={4} className="movie-card-title">
        {movie.title}
      </Title>

      <div className="movie-card-rating-row">
        <Tag color={getRatingColor(Number(movie.rating))}>
          ★ {movie.rating ?? 'N/A'}/10
        </Tag>
      </div>

      <div className="movie-card-actors" title={movie.actors || 'No actors listed'}>
        <span className="actors-label">Cast: </span>
        <span className="actors-names">{movie.actors || 'N/A'}</span>
      </div>

      <div className="movie-card-action">
        <Switch
          checked={Boolean(isWatchlisted)}
          onChange={() => toggleWatchlist(movie.id)}
          checkedChildren="In Watchlist"
          unCheckedChildren="Add to Watchlist"
        />
      </div>

      {(onEdit || onDelete) && (
        <div className="movie-card-crud-actions">
          {onEdit && (
            <Tooltip title="Edit Movie">
              <Button
                type="text"
                size="small"
                icon={<EditOutlined />}
                className="movie-card-icon-btn edit-btn"
                onClick={() => onEdit(movie)}
                aria-label={`Edit ${movie.title}`}
              />
            </Tooltip>
          )}

          {onDelete && (
            <Popconfirm
              title="Delete Movie"
              description={`Are you sure you want to delete "${movie.title}"?`}
              onConfirm={() => onDelete(movie)}
              okText="Delete"
              cancelText="Cancel"
              okButtonProps={{ danger: true }}
            >
              <Tooltip title="Delete Movie">
                <Button
                  type="text"
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                  className="movie-card-icon-btn delete-btn"
                  aria-label={`Delete ${movie.title}`}
                />
              </Tooltip>
            </Popconfirm>
          )}
        </div>
      )}
    </Card>
  );
};

export default MovieCard;



//Without Ant design
// import "../styles.css";

// const MovieCard = ({ movie, isWatchlisted, toggleWatchlist }) => {
//   const handleError = (e) => {
//     e.target.src = "images/default.jpg";
//   };

//   const getRatingClass = (rating) => {
//     if (rating >= 8) return "rating-good";

//     if (rating >= 5 && rating < 8) return "rating-ok";

//     return "rating-bad";
//   };

//   return (
//     <div key={movie.id} className="movie-card">
//       <img
//         src={`images/${movie.image}`}
//         alt={movie.title}
//         onError={handleError}
//       />
//       <div className="movie-card-info">
//         <h3 className="movie-card-title">{movie.title}</h3>
//         <div>
//           <span className="movie-card-genre">{movie.genre}</span>
//           <span className={`movie-card-rating ${getRatingClass(movie.rating)}`}>
//             {movie.rating}
//           </span>
//         </div>
//         <label className="switch">
//           <input
//             type="checkbox"
//             checked={isWatchlisted}
//             onChange={() => toggleWatchlist(movie.id)}
//           ></input>

//           <span className="slider">
//             <span className="slider-label">
//               {isWatchlisted ? "In Watchlist" : "Add to Watchlist"}
//             </span>
//           </span>
//         </label>
//       </div>
//     </div>
//   );
// }

// export default MovieCard;