import { useState } from 'react';
import './App.css'

interface Card {
  suit: string
  rank: string
}

interface Weapon {
	strength: number
	last: number
}

type Deck = Card[];

const createDeck = (): Deck => {
  const deck: Deck = [];
  const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
  const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']

  suits.forEach((suit) => {
    ranks.forEach((rank) => {
      if(suit === 'hearts' || suit === 'diamonds') {
        switch(rank) {
          case 'J':
          case 'Q':
          case 'K':
          case 'A':
            return;
        }
      }
      const card: Card = {suit, rank}
      deck.push(card);
    })
  })

  return deck
}

function shuffle<T>(array: T[]): T[] {
  const result = [...array];

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]]
  }

  return result
}


function App() {
  const [deck, setDeck] = useState<Deck>(shuffle(createDeck()))
  const [hand, setHand] = useState<Deck>([])
	const [life, setLife] = useState(20)
	const [weapon, setWeapon] = useState<Weapon>()
  
  const drawCards = (count: number) => {
    const drawn = deck.slice(0, count);
    setHand((prevHand => [...prevHand, ...drawn]))
    setDeck((prevDeck) => prevDeck.slice(count))
  }

  const putBack = () => {
    setDeck((prevDeck) => [...prevDeck, ...hand])
    setHand([])
  }

	const handleCard = (card: Card) => {
		if(card.suit === 'clubs' || card.suit === 'spades') {
			let damage = 0
			switch(card.rank) {
				  case 'J':
						damage = 11
						break
          case 'Q':
						damage = 12
						break
          case 'K':
						damage = 13
						break
          case 'A':
						damage = 14
						break
					default:
						damage = Number(card.rank)
						break;
			}
			setLife(life - damage)
			removeCardHand(card)
		} else if(card.suit === 'hearts') {
			const heal = Number(card.rank)
			setLife(Math.min(life + heal, 20))
			removeCardHand(card)
		} else if(card.suit === 'diamonds') {
			setWeapon({strength: Number(card.rank), last: 0})
			removeCardHand(card)
		}
	}

	const removeCardHand = (cardToRemove: Card) => {
		setHand(prev =>
			prev.filter(card =>
				!(card.suit === cardToRemove.suit && card.rank === cardToRemove.rank)
			)
		)
	}

  return (
    <>
      <button onClick={() => {setDeck(createDeck())}}>
        Test deck creation
      </button>
      <button onClick={() => setDeck(shuffle(deck))}>
        Shuffle
      </button>
      {deck && (
        <ul>
          {deck.map((card) => (
            <li>
              {card.rank} of {card.suit}
            </li>
          ))}
        </ul>
      )}
      <button onClick={() => drawCards(4)}>
        Draw 4
      </button>
      <button onClick={() => putBack()}>
        Put back
      </button>
      {hand && (
        <ul>
          {hand.map((card: Card) => (
            <li>
              <div onClick={() => (handleCard(card))}>
								{card.rank} of {card.suit}
								</div>
            </li>
          ))}
        </ul>
      )}
			<div>Current life: {life}</div>
			<div>Current weapon: {weapon ? (
				<>
					{weapon.strength}
				</>) : "none"}
			</div>
    </>
  )
}

export default App
