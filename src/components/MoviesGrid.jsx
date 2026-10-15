// import { Empty, Spin } from 'antd';
// import MovieCard from './MovieCard';

// export default function MoviesGrid({
//   movies = [],
//   loading = false,
//   onAddToWatchlist,
//   watchlistIds = [],
// }) {
//   if (loading && movies.length === 0) {
//     return (
//       <div className="centered-state">
//         <Spin size="large" />
//       </div>
//     );
//   }

//   if (movies.length === 0) {
//     return (
//       <Empty
//         description="No movies found."
//       />
//     );
//   }

//   return (
//     <div className="movies-grid">
//       {movies.map((movie) => {
//         const id = String(movie.id);

//         return (
//           <MovieCard
//             key={id}
//             movie={movie}
//             onAddToWatchlist={onAddToWatchlist}
//             isInWatchlist={watchlistIds.includes(id)}
//           />
//         );
//       })}
//     </div>
//   );
// }


// Ant design V1
import { useState, useMemo } from 'react';
import {
  Input,
  Select,
  Row,
  Col,
  Space,
  Typography,
  Empty,
  Spin,
  Button,
  Modal,
  Form,
  InputNumber,
  Alert,
} from 'antd';
import { SearchOutlined, PlusOutlined, UserOutlined } from '@ant-design/icons';
import MovieCard from './MovieCard';
import useMovies from '../hooks/useMovies';

const { Title } = Typography;

const MoviesGrid = ({
  watchlist = [],
  toggleWatchlist,
  onCreateMovie,
  onUpdateMovie,
  onDeleteMovie,
  isMutating = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [actorsTerm, setActorsTerm] = useState('');
  const [rating, setRating] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);
  const [form] = Form.useForm();

  // Backend query criteria: { title, actors, rating }
  const criteria = useMemo(() => {
    return {
      ...(searchTerm.trim() ? { title: searchTerm.trim() } : {}),
      ...(actorsTerm.trim() ? { actors: actorsTerm.trim() } : {}),
      ...(rating !== '' && rating !== 'All' ? { rating: Number(rating) } : {}),
    };
  }, [searchTerm, actorsTerm, rating]);

  // Call custom SWR hook with criteria directly from component
  const {
    movies = [],
    isLoading: isMoviesLoading,
    error: moviesError,
    errorMessage,
  } = useMovies(criteria);

  const handleOpenAdd = () => {
    setEditingMovie(null);
    form.resetFields();
    form.setFieldsValue({
      title: '',
      actors: '',
      rating: 8,
      posterUrl: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (movie) => {
    setEditingMovie(movie);
    form.setFieldsValue({
      title: movie.title || '',
      actors: movie.actors || '',
      rating: movie.rating != null && movie.rating !== 'N/A' ? Number(movie.rating) : 8,
      posterUrl: movie.posterUrl || '',
    });
    setIsModalOpen(true);
  };

  const handleCancelModal = () => {
    setIsModalOpen(false);
    setEditingMovie(null);
    form.resetFields();
  };

  const handleFormSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingMovie) {
        if (onUpdateMovie) {
          await onUpdateMovie({
            ...editingMovie,
            ...values,
          });
        }
      } else if (onCreateMovie) {
        await onCreateMovie(values);
      }
      handleCancelModal();
    } catch {
      // Validation or API error handled by form / mutation hook
    }
  };

  const ratingOptions = [
    { value: '', label: 'All Ratings' },
    { value: '1', label: '1' },
    { value: '2', label: '2' },
    { value: '3', label: '3' },
    { value: '4', label: '4' },
    { value: '5', label: '5' },
    { value: '6', label: '6' },
    { value: '7', label: '7' },
    { value: '8', label: '8' },
    { value: '9', label: '9' },
    { value: '10', label: '10' },
  ];

  return (
    <div className="movies-container">
      <Title level={2} className="section-title">
        Discover Movies
      </Title>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} md={12}>
          <Input
            size="large"
            placeholder="Search by movie title..."
            prefix={<SearchOutlined />}
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            allowClear
          />
        </Col>
        <Col xs={24} md={12}>
          <Input
            size="large"
            placeholder="Search by actors (e.g. Aamir, Yash)..."
            prefix={<UserOutlined />}
            value={actorsTerm}
            onChange={(event) => setActorsTerm(event.target.value)}
            allowClear
          />
        </Col>
      </Row>

      <Space className="filter-bar" size="middle" wrap>
        <Select
          aria-label="Filter by rating"
          value={rating}
          onChange={setRating}
          style={{ width: 140 }}
          options={ratingOptions}
        />

        {onCreateMovie && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleOpenAdd}
          >
            Add Movie
          </Button>
        )}
      </Space>

      {moviesError && (
        <Alert
          type="error"
          showIcon
          message="Failed to load movies from backend"
          description={errorMessage || 'Make sure Quarkus backend is running on http://localhost:8080.'}
          style={{ marginBottom: 20 }}
        />
      )}

      {isMoviesLoading && movies.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <Spin size="large" />
        </div>
      ) : movies.length === 0 ? (
        <Empty description="No movies found" />
      ) : (
        <Row gutter={[24, 24]} className="movies-grid">
          {movies.map((movie) => (
            <Col
              key={movie.id}
              xs={24}
              sm={12}
              md={8}
              lg={6}
              xl={6}
            >
              <MovieCard
                movie={movie}
                isWatchlisted={watchlist.some((id) => String(id) === String(movie.id))}
                toggleWatchlist={toggleWatchlist}
                onEdit={onUpdateMovie ? handleOpenEdit : undefined}
                onDelete={onDeleteMovie}
              />
            </Col>
          ))}
        </Row>
      )}

      <Modal
        title={editingMovie ? 'Edit Movie' : 'Add New Movie'}
        open={isModalOpen}
        onOk={handleFormSubmit}
        onCancel={handleCancelModal}
        okText={editingMovie ? 'Update' : 'Add'}
        confirmLoading={isMutating}
        destroyOnHidden
      >
        <Form
          form={form}
          layout="vertical"
          name="movie_form"
        >
          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: 'Please enter the movie title' }]}
          >
            <Input placeholder="e.g. Inception" />
          </Form.Item>

          <Form.Item
            name="actors"
            label="Actors"
          >
            <Input placeholder="e.g. Leonardo DiCaprio, Tom Hardy" />
          </Form.Item>


          <Form.Item
            name="rating"
            label="Rating (0 - 10)"
            rules={[
              { required: true, message: 'Please enter a rating' },
              { type: 'number', min: 0, max: 10, message: 'Rating must be between 0 and 10' },
            ]}
          >
            <InputNumber
              min={0}
              max={10}
              step={1}
              style={{ width: '100%' }}
              placeholder="8"
            />
          </Form.Item>

          <Form.Item
            name="posterUrl"
            label="Poster URL (Optional)"
          >
            <Input placeholder="https://example.com/poster.jpg" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MoviesGrid;





//Without Ant design
// import React, { useState } from "react";
// import "../styles.css";
// import MovieCard from "./MovieCard";

// const MoviesGrid = ({ movies, watchlist, toggleWatchlist }) => {
//   const [searchTerm, setSearchTerm] = useState("");

//   const [genre, setGenre] = useState("All Genres");
//   const [rating, setRating] = useState("All");

//   const handleSearchChange = (e) => {
//     setSearchTerm(e.target.value);
//   };

//   const handleGenreChange = (e) => {
//     setGenre(e.target.value);
//   };

//   const handleRatingChange = (e) => {
//     setRating(e.target.value);
//   };

//   const matchesGenre = (movie, genre) => {
//     return (
//       genre === "All Genres" ||
//       movie.genre.toLowerCase() === genre.toLowerCase()
//     );
//   };

//   const matchesSearchTerm = (movie, searchTerm) => {
//     return movie.title.toLowerCase().includes(searchTerm.toLowerCase());
//   };

//   const matchesRating = (movie, rating) => {
//     switch (rating) {
//       case "All":
//         return true;

//       case "Good":
//         return movie.rating >= 8;

//       case "Ok":
//         return movie.rating >= 5 && movie.rating < 8;

//       case "Bad":
//         return movie.rating < 5;

//       default:
//         return false;
//     }
//   };

//   const filteredMovies = movies.filter(
//     (movie) =>
//       matchesGenre(movie, genre) &&
//       matchesRating(movie, rating) &&
//       matchesSearchTerm(movie, searchTerm)
//   );

//   return (
//     <div>
//       <input
//         type="text"
//         className="search-input"
//         placeholder="Search movies..."
//         value={searchTerm}
//         onChange={handleSearchChange}
//       />

//       <div className="filter-bar">
//         <div className="filter-slot">
//           <label>Genre</label>
//           <select
//             className="filter-dropdown"
//             value={genre}
//             onChange={handleGenreChange}
//           >
//             <option>All Genres</option>
//             <option>Action</option>
//             <option>Drama</option>
//             <option>Fantasy</option>
//             <option>Horror</option>
//           </select>
//         </div>

//         <div className="filter-slot">
//           <label>Rating</label>
//           <select
//             className="filter-dropdown"
//             value={rating}
//             onChange={handleRatingChange}
//           >
//             <option>All</option>
//             <option>Good</option>
//             <option>Ok</option>
//             <option>Bad</option>
//           </select>
//         </div>
//       </div>

//       <div className="movies-grid">
//         {filteredMovies.map((movie) => (
//           <MovieCard
//             movie={movie}
//             key={movie.id}
//             toggleWatchlist={toggleWatchlist}
//             isWatchlisted={watchlist.includes(movie.id)}
//           ></MovieCard>
//         ))}
//       </div>
//     </div>
//   );
// }

// export default MoviesGrid;