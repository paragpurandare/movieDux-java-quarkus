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
import { useState } from 'react';
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
} from 'antd';
import { SearchOutlined, PlusOutlined } from '@ant-design/icons';
import MovieCard from './MovieCard';

const { Title } = Typography;

const MoviesGrid = ({
  movies = [],
  watchlist = [],
  toggleWatchlist,
  loading = false,
  onCreateMovie,
  onUpdateMovie,
  onDeleteMovie,
  isMutating = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [genre, setGenre] = useState('All Genres');
  const [rating, setRating] = useState('All');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);
  const [form] = Form.useForm();

  const handleOpenAdd = () => {
    setEditingMovie(null);
    form.resetFields();
    form.setFieldsValue({
      title: '',
      actors: '',
      genre: 'Action',
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
      genre: movie.genre || 'Action',
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

  const matchesGenre = (movie) =>
    genre === 'All Genres' ||
    (movie.genre || '').toLowerCase() === genre.toLowerCase();

  const matchesSearchTerm = (movie) =>
    (movie.title || '').toLowerCase().includes(searchTerm.toLowerCase());

  const matchesRating = (movie) => {
    switch (rating) {
      case 'All':
        return true;
      case 'Good':
        return Number(movie.rating) >= 8;
      case 'Ok':
        return Number(movie.rating) >= 5 && Number(movie.rating) < 8;
      case 'Bad':
        return Number(movie.rating) < 5;
      default:
        return true;
    }
  };

  const filteredMovies = movies.filter(
    (movie) =>
      matchesGenre(movie) &&
      matchesRating(movie) &&
      matchesSearchTerm(movie)
  );

  return (
    <div className="movies-container">
      <Title level={2} className="section-title">
        Discover Movies
      </Title>

      <Input
        size="large"
        className="movie-search"
        placeholder="Search movies..."
        prefix={<SearchOutlined />}
        value={searchTerm}
        onChange={(event) => setSearchTerm(event.target.value)}
        allowClear
      />

      <Space className="filter-bar" size="middle" wrap>
        <Select
          aria-label="Filter by genre"
          value={genre}
          onChange={setGenre}
          style={{ width: 180 }}
          options={[
            { value: 'All Genres', label: 'All Genres' },
            { value: 'Action', label: 'Action' },
            { value: 'Drama', label: 'Drama' },
            { value: 'Fantasy', label: 'Fantasy' },
            { value: 'Horror', label: 'Horror' },
          ]}
        />

        <Select
          aria-label="Filter by rating"
          value={rating}
          onChange={setRating}
          style={{ width: 160 }}
          options={[
            { value: 'All', label: 'All Ratings' },
            { value: 'Good', label: 'Good (8+)' },
            { value: 'Ok', label: 'Okay (5–7.9)' },
            { value: 'Bad', label: 'Bad (<5)' },
          ]}
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

      {loading && movies.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <Spin size="large" />
        </div>
      ) : filteredMovies.length === 0 ? (
        <Empty description="No movies found" />
      ) : (
        <Row gutter={[24, 24]} className="movies-grid">
          {filteredMovies.map((movie) => (
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
            name="genre"
            label="Genre"
            rules={[{ required: true, message: 'Please select a genre' }]}
          >
            <Select
              options={[
                { value: 'Action', label: 'Action' },
                { value: 'Drama', label: 'Drama' },
                { value: 'Fantasy', label: 'Fantasy' },
                { value: 'Horror', label: 'Horror' },
              ]}
            />
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