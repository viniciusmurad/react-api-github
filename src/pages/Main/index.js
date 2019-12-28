import React, { Component } from 'react';
import { FaGithubAlt, FaPlus, FaSpinner } from 'react-icons/fa';
import { Link } from 'react-router-dom';

import api from '../../services/api';

import { Form, SubmitButton, List } from './styles';

import Container from '../../components/Container';

export default class Main extends Component {
    state = {
        newRepo: '',
        repositories: [],
        loading: false,
        isInvalid: false,
    };

    componentDidMount() {
        const repositories = localStorage.getItem('repositories');

        if (repositories) {
            this.setState({ repositories: JSON.parse(repositories) });
        }
    }

    componentDidUpdate(_, prevState) {
        const { repositories } = this.state;
        if (prevState.repositories !== repositories) {
            localStorage.setItem('repositories', JSON.stringify(repositories));
        }
    }

    handleInputChange = e => {
        this.setState({ newRepo: e.target.value, isInvalid: false });
    };

    handleSubmit = async e => {
        e.preventDefault();

        this.setState({ loading: true });

        try {
            const { newRepo, repositories } = this.state;

            if (newRepo === '') throw new Error('You must enter a value.');

            const isDuplicated = repositories.find(r => r.name === newRepo);

            if (isDuplicated) throw new Error('Duplicated repository.');

            const response = await api.get(`/repos/${newRepo}`);

            const data = {
                name: response.data.full_name,
            };

            this.setState({
                repositories: [...repositories, data],
                newRepo: '',
                loading: false,
            });
        } catch (err) {
            this.setState({
                loading: false,
                isInvalid: true,
            });
        }
    };

    render() {
        const { newRepo, repositories, loading, isInvalid } = this.state;

        return (
            <Container>
                <h1>
                    <FaGithubAlt />
                    Repositories
                </h1>

                <Form onSubmit={this.handleSubmit} isInvalid={isInvalid}>
                    <input
                        type="text"
                        placeholder="Add a repository"
                        value={newRepo}
                        onChange={this.handleInputChange}
                    />
                    <SubmitButton loading={loading ? 1 : 0}>
                        {loading ? (
                            <FaSpinner color="#FFF" size={14} />
                        ) : (
                            <FaPlus color="#FFF" size={14} />
                        )}
                    </SubmitButton>
                </Form>

                <List>
                    {repositories.map(repository => (
                        <li key={repository.name}>
                            <span>{repository.name}</span>
                            <Link
                                to={`/repository/${encodeURIComponent(
                                    repository.name
                                )}`}
                            >
                                Details
                            </Link>
                        </li>
                    ))}
                </List>
            </Container>
        );
    }
}
