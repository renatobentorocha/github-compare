import React, { Component } from 'react';
import moment from 'moment';
import { Container, Form } from './styles';

import logo from '../../assets/logo.png';

import CompareList from '../../components/CompareList';
import api from '../../services/api';

export default class Main extends Component {
  state = {
    loading: false,
    repositoryError: false,
    repositoryInput: '',
    repositories: [],
  };

  componentDidMount() {
    this.loadLocalStorage();
  }

  loadLocalStorage = () => {
    const storageKey = 'repositories';

    let localStorageReposirories = JSON.parse(localStorage.getItem(storageKey));

    if (localStorageReposirories)
      this.setState({
        repositories: [...this.state.repositories, ...localStorageReposirories],
        repositoryInput: '',
        repositoryError: false,
      });
  };

  handleAddRepository = async e => {
    e.preventDefault();

    this.setState({ loading: true });

    try {
      const { data: repository } = await api.get(`/repos/${this.state.repositoryInput}`);

      repository.lastCommit = moment(repository.pushed_at).fromNow();

      this.setState({
        repositories: [...this.state.repositories, repository],
        repositoryInput: '',
        repositoryError: false,
      });

      this.saveLocalStorage(repository);
    } catch (error) {
      console.log(error);
      this.setState({ repositoryError: true });
    } finally {
      this.setState({ loading: false });
    }
  };

  saveLocalStorage = repository => {
    const storageKey = 'repositories';

    let localStorageReposirories = JSON.parse(localStorage.getItem(storageKey));

    if (localStorageReposirories)
      localStorageReposirories = [...localStorageReposirories, repository];
    else localStorageReposirories = [repository];

    localStorage.setItem(storageKey, JSON.stringify(localStorageReposirories));
  };

  removeFromLocalStorage = id => {
    const storageKey = 'repositories';

    let index = 0;
    let repositories = this.state.repositories;

    if (repositories) {
      index = repositories.findIndex((value, index, array) => value.id === id);

      repositories.splice(index, 1);
      localStorage.setItem(storageKey, JSON.stringify(repositories));

      this.setState({
        repositories: [...repositories],
        repositoryInput: '',
        repositoryError: false,
      });
    }
  };

  updateRepository = async full_name => {
    const storageKey = 'repositories';

    try {
      const { data: repository } = await api.get(`/repos/${full_name}`);

      repository.lastCommit = moment(repository.pushed_at).fromNow();

      let repositories = this.state.repositories;

      const index = repositories.findIndex((value, index, array) => value.id === repository.id);

      repositories[index] = repository;

      this.setState({
        repositories: [...repositories],
        repositoryInput: '',
        repositoryError: false,
      });

      localStorage.setItem(storageKey, JSON.stringify(repositories));

      console.log('atualizando');
    } catch (error) {
      console.log(error);
      this.setState({ repositoryError: true });
    } finally {
      this.setState({ loading: false });
    }
  };

  render() {
    return (
      <Container>
        <img src={logo} alt="Git compare" />

        <Form withError={this.state.repositoryError} onSubmit={this.handleAddRepository}>
          <input
            type="text"
            name=""
            id=""
            placeholder="usuário/repositório"
            value={this.state.repositoryInput}
            onChange={e => this.setState({ repositoryInput: e.target.value })}
          />
          <button type="submit">
            {this.state.loading ? <i className="fa fa-spinner fa-pulse" /> : 'OK'}
          </button>
        </Form>

        <CompareList
          repositories={this.state.repositories}
          removeRepository={this.removeFromLocalStorage}
          updateRepository={this.updateRepository}
        />
      </Container>
    );
  }
}
