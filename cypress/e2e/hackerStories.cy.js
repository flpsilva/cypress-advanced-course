
describe('Hacker Stories', () => {
  const initialTerm = 'React'
  const newTerm = 'Cypress'

  context('hitting the real API', () => {
    beforeEach(() => {
      cy.intercept({
        method: 'GET',
        pathname: '**/search',
        query: {
          query: 'React',
          page: '0'
        }

      }).as('getStories')
      cy.visit('/')
      cy.wait('@getStories')

      cy.get('#search')
        .should('be.visible')
			  .clear()
    })
    it('shows 20 stories, then the next 20 after clicking "More"', () => {
      cy.intercept({
				   method: 'GET',
				  pathname: '**/search',
				   query: {
				    query: 'React',
				    page: '1'
				  }
      }).as('getNextStories')
      cy.get('.item').should('have.length', 20)

      cy.contains('More')
        .should('be.visible')
        .click()
      cy.wait('@getNextStories')

      cy.get('.item').should('have.length', 40)
    })

    it('searches via the last searched term', () => {
      cy.intercept(
        'GET',
				`**/search?query=${newTerm}&page=0`
			  ).as('getNewTermStories')
			  cy.intercept(
        'GET',
				`**/search?query=${initialTerm}&page=0`
			  ).as('getStories2')

			  cy.get('#search')
        .type(`${newTerm}{enter}`)

			  cy.wait('@getNewTermStories')

        cy.getLocalStorage('search')
          .should('be.equal', newTerm)

			  cy.get(`button:contains(${initialTerm})`)
        .should('be.visible')
        .click()

			  cy.wait('@getStories2')

        cy.getLocalStorage('search')
          .should('be.equal', initialTerm)

			  cy.get('.item').should('have.length', 20)
			  cy.get('.item')
        .first()
        .should('contain', initialTerm)
			  cy.get(`button:contains(${newTerm})`)
        .should('be.visible')
    })
  })

  context('Mocking the API', () => {
    context('Footer and list of stories', () => {
      beforeEach(() => {
        cy.intercept(
          'GET',
      `**/search?query=${initialTerm}&page=0`,
      { fixture: 'stories' }).as('getStories')
        cy.visit('/')
        cy.wait('@getStories')
        // #region a different way to solve the same problem:
        // cy.intercept('GET', '**/search?query=React&page=0').as('getStories')
        // cy.visit('/')
        // cy.wait('@getStories')
        // #endregion
      })

      it('shows the footer', () => {
        cy.get('footer')
          .should('be.visible')
          .and('contain', 'Icons made by Freepik from www.flaticon.com')
      })
      context('List of stories', () => {
        const stories = require('../fixtures/stories')
        it('shows the right data for all rendered stories', () => {
          cy.get('.item')
            .first()
            .should('contain', stories.hits[0].title)
            .and('contain', stories.hits[0].author)
            .and('contain', stories.hits[0].num_comments)
            .and('contain', stories.hits[0].points)
            .and('be.visible')
          cy.get(`.item a:contains(${stories.hits[0].title})`)
            .should('have.attr', 'href', stories.hits[0].url)

          cy.get('.item')
            .last()
            .should('contain', stories.hits[1].title)
            .and('contain', stories.hits[1].author)
            .and('contain', stories.hits[1].num_comments)
            .and('contain', stories.hits[1].points)
            .and('be.visible')
          cy.get(`.item a:contains(${stories.hits[1].title})`)
            .should('have.attr', 'href', stories.hits[1].url)
        })

        it('shows ony story less after dimissing the first one', () => {
          cy.get('.button-small')
            .first()
            .should('be.visible')
            .click()

          cy.get('.item').should('have.length', 1)
        })

        context('Order by', () => {
          it('orders by title', () => {
            cy.get('.list-header-button:contains(Title)')
              .as('titleHeader')
              .should('be.visible')
              .click()

            cy.get('.item')
              .first()
              .should('contain', stories.hits[0].title)
            cy.get(`.item a:contains(${stories.hits[0].title})`)
              .should('have.attr', 'href', stories.hits[0].url)

            cy.get('@titleHeader')
              .click()

            cy.get('.item')
              .first()
              .should('contain', stories.hits[1].title)
            cy.get(`.item a:contains(${stories.hits[1].title})`)
              .should('have.attr', 'href', stories.hits[1].url)
          })

          it('orders by author', () => {
            cy.get('.list-header-button:contains(Author)')
              .as('authorHeader')
              .should('be.visible')
              .click()

            cy.get('.item')
              .first()
              .should('contain', stories.hits[0].author)
            cy.get('@authorHeader')
              .click()
          })

          it('orders by comments', () => {
            cy.get('.list-header-button:contains(Comments)')
              .as('commentsHeader')
              .should('be.visible')
              .click()

            cy.get('.item')
              .first()
              .should('contain', stories.hits[1].num_comments)
            cy.get('@commentsHeader')
              .click()

            cy.get('.item')
              .first()
              .should('contain', stories.hits[0].num_comments)
          })

          it('orders by points', () => {
            cy.get('.list-header-button:contains(Points)')
              .as('pointsHeader')
              .should('be.visible')
              .click()

            cy.get('.item')
              .first()
              .should('contain', stories.hits[1].points)
            cy.get('@pointsHeader')
              .click()

            cy.get('.item')
              .first()
              .should('contain', stories.hits[0].points)
          })
        })
      })
    })

    context('Search', () => {
      beforeEach(() => {
        cy.intercept(
          'GET',
      `**/search?query=${initialTerm}&page=0`,
      { fixture: 'empty' }
        ).as('getEmptyStories')
        cy.intercept(
          'GET',
					`**/search?query=${newTerm}&page=0`,
					{ fixture: 'stories' }
        ).as('getNewTermStories')

        cy.visit('/')
        cy.wait('@getEmptyStories')

        cy.get('#search')
          .should('be.visible')
          .clear()
      })

      it('shows no story when none is returned', () => {
        cy.get('.item').should('not.exist')
      })

      it('types and hits ENTER', () => {
        cy.get('#search')
          .type(`${newTerm}{enter}`)

        // refactored => cy.assertLoadingIsShownAndHidden() by:
        cy.wait('@getNewTermStories')

        cy.getLocalStorage('search')
          .should('be.equal', newTerm)

        cy.get('.item').should('have.length', 2)

        cy.get(`button:contains(${initialTerm})`)
          .should('be.visible')
      })

      it('types and clicks the submit button', () => {
        cy.get('#search')
          .type(newTerm)
        cy.contains('Submit')
          .click()
        // refactored => cy.assertLoadingIsShownAndHidden() by:
        cy.wait('@getNewTermStories')

        cy.getLocalStorage('search')
          .should('be.equal', newTerm)

        cy.get('.item').should('have.length', 2)
        cy.get(`button:contains(${initialTerm})`)
          .should('be.visible')
      })

      // #region //just an example how to submit a form directly, this is not how real users interact with the application.
      // it.only('types and submits the form directly', () => {
      // 	cy.get('#search')
      // 	  .type(newTerm)
      // 	cy.get('form')
      // 	  .submit()
      // 	cy.wait('@getNewTermStories')

      // 	cy.get('.item').should('have.length', 20)
      // 	cy.get('.item')
      // 		.first()
      // 		.should('contain', newTerm)
      // 	cy.get(`button:contains(${initialTerm})`)
      // 		.should('be.visible')
      // })
      // #endregion

      context('Last searches', () => {
        it('shows a max of 5 buttons for the last searched terms', () => {
          const faker = require('faker')
          
          cy.intercept(
            'GET',
            '**/search**',
            { fixture: 'empty' }
          ).as('getRadomStories')

          Cypress._.times(6, () => {
            const radomWord = faker.random.word()
            cy.get('#search')
              .clear()
              .type(`${radomWord}{enter}`)
            cy.wait('@getRadomStories')
            
            cy.getLocalStorage('search')
              .should('be.equal', radomWord)
          })
          cy.get('.last-searches button')
            .should('have.length', 5)
          //#region OPTION: the same assertion using .within command
          // cy.get('.last-searches')
          //   .within( () => {
          //     cy.get('button')
          //       .should('have.length', 5)
          //   })
          //#endregion
        })
      })
    })
  })
  // Hrm, how would I simulate such errors?
  context('Errors', () => {
    const errorMsg = 'Oops! Try again later'
    it('shows "Something went wrong ..." in case of a server error', () => {
      cy.intercept(
        'GET',
        '**/search**',
        { statusCode: 500 }).as('getServerFailure')
      cy.visit('/')
      cy.wait('@getServerFailure')

      cy.get('p:contains(Something went wrong ...)')
    .should('be.visible')
    })

    it('shows "Something went wrong ..." in case of a network error', () => {
      cy.intercept(
        'GET',
        '**/search**',
        { forceNetworkError: true }).as('getNetworkFailure')
      cy.visit('/')
      cy.wait('@getNetworkFailure')

      cy.get('p:contains(Something went wrong ...)')
        .should('be.visible')
    })
  })
})

it('shows a "Loading ..." state before showing the results', () => {
  cy.intercept(
    'GET',
    '**/search**',
    {
      delay: 1000,
      fixture: 'stories'
    }
  ).as('getDelayedStories')

  cy.visit('/')

  cy.assertLoadingIsShownAndHidden()
  cy.wait('@getDelayedStories')
  cy.get('.item').should('have.length', 2)
});
