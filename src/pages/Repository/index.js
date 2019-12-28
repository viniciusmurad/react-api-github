import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import api from '../../services/api';

import Container from '../../components/Container';

import { Loading, Owner, IssueList, SelectFilter } from './styles';

export default class Repository extends Component {
    state = {
        repository: {},
        issues: [],
        filters: [
            { state: 'all', label: 'All', active: true },
            { state: 'open', label: 'Open', active: false },
            { state: 'closed', label: 'Closed', active: false },
        ],
        // filterLabel: 'all',
        loading: true,
    };

    async componentDidMount() {
        const { match } = this.props;
        const { filters } = this.state;

        const repoName = decodeURIComponent(match.params.repository);

        const [repository, issues] = await Promise.all([
            api.get(`/repos/${repoName}`),
            api.get(`/repos/${repoName}/issues`, {
                params: {
                    state: filters[0].state,
                    per_page: 10,
                },
            }),
        ]);

        this.setState({
            repository: repository.data,
            issues: issues.data,
            loading: false,
        });
    }

    changeSelectFilter = e => {
        const { filters } = this.state;
        filters.forEach(f => {
            if (f.state === e.target.value.toLowerCase()) {
                f.active = true;
            } else {
                f.active = false;
            }
        });

        this.setState({
            filters,
            // filterLabel: e.target.value.toLowerCase(),
        });

        this.loadIssues(e.target.value.toLowerCase());
    };

    loadIssues = async filter => {
        const { match } = this.props;
        const repoName = decodeURIComponent(match.params.repository);

        const issues = await Promise.all([
            api.get(`/repos/${repoName}/issues`, {
                params: {
                    state: filter,
                    per_page: 10,
                },
            }),
        ]);

        this.setState({ issues: issues.data });
    };

    render() {
        const { repository, issues, loading, filters } = this.state;

        if (loading) {
            return <Loading>Loading...</Loading>;
        }
        return (
            <Container>
                <Owner>
                    <Link to="/">Back to repositories</Link>
                    <img
                        src={repository.owner.avatar_url}
                        alt={repository.owner.login}
                    />
                    <h1>{repository.name}</h1>
                    <p>{repository.description}</p>
                </Owner>

                <SelectFilter onChange={this.changeSelectFilter}>
                    {filters.map(filter => (
                        <option key={filter.state}>{filter.label}</option>
                    ))}
                </SelectFilter>

                <IssueList>
                    {issues.map(issue => (
                        <li key={String(issue.id)}>
                            <img
                                src={issue.user.avatar_url}
                                alt={issue.user.login}
                            />
                            <div>
                                <strong>
                                    <a href={issue.html_url}>{issue.title}</a>
                                    {issue.labels.map(label => (
                                        <span key={String(label.id)}>
                                            {label.name}
                                        </span>
                                    ))}
                                </strong>
                                <p>{issue.user.login}</p>
                            </div>
                        </li>
                    ))}
                </IssueList>
            </Container>
        );
    }
}

Repository.propTypes = {
    match: PropTypes.shape({
        params: PropTypes.shape({
            repository: PropTypes.string,
        }),
    }).isRequired,
};
