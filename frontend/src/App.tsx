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
  const [skipped, setSkipped] = useState(false)
  const [healed, setHealed] = useState(false)
  const [opponent, setOpponent] = useState<Card>()
  const [gameOver, setGameOver] = useState(false)
  const [score, setScore] = useState(-208)

  const handleRestart = () => {  
    setDeck(shuffle(createDeck()))
    setHand([])
    setLife(20)
    setWeapon(undefined)
    setSkipped(false)
    setHealed(false)
    setOpponent(undefined)
    setGameOver(false)
    setScore(-208)
  }

  const drawCards = (count: number) => {
    const drawn = deck.slice(0, count);
    setHand((prevHand => [...prevHand, ...drawn]))
    setDeck((prevDeck) => prevDeck.slice(count))
  }

  const putBack = () => {
    setDeck((prevDeck) => [...prevDeck, ...hand])
    setHand([])
  }

  const handleSkip = () => {
    setSkipped(true)
    putBack()
    drawCards(4)
    setHealed(false)
  }

	const handleCard = (card: Card) => {
		if(card.suit === 'clubs' || card.suit === 'spades') {
      setOpponent(card)
		} else if(card.suit === 'hearts') {
      const heal = healed ? 0 : Number(card.rank)
			setLife(Math.min(life + heal, 20))
			removeCardHand(card)
      setSkipped(true)
      setHealed(true)
      if(hand.length === 2) {
        drawCards(3)
        setSkipped(false)
        setHealed(false)
      } else if (hand.length === 1 && !deck) {
        setGameOver(true)
        setScore(score + (life + heal - 20))
      }
		} else if(card.suit === 'diamonds') {
			setWeapon({strength: Number(card.rank), last: 0})
			removeCardHand(card)
      setSkipped(true)
      if(hand.length === 2) {
        drawCards(3)
        setSkipped(false)
        setHealed(false)
      }  else if (hand.length === 1 && !deck) {
        setGameOver(true)
      }
		}
	}

  const fight = (card: Card, weapon: Weapon) => {
		let damage = getPower(card)

    setScore(score + damage)

    if (weapon.last > -1) {
      setWeapon({...weapon, last: damage})
      damage = Math.max(damage - weapon.strength, 0)
    }

    setLife(life - damage)
		removeCardHand(card)
    setOpponent(undefined)

    if(life - damage <= 0) {
      setGameOver(true)
    }

    setSkipped(true)

    if(hand.length === 2) {
      drawCards(3)
      setSkipped(false)
      setHealed(false)
    }  else if (hand.length === 1 && !deck) {
      setGameOver(true)
    }
  }

  const getPower = (card: Card) => {
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
    return damage
  }

  const getNeatEnemy = (str: number) => {
    switch(str) {
      case 11:
        return 'J'
      case 12:
        return 'Q'
      case 13:
        return 'K'
      case 14:
        return 'A'
      default:
        return str
    }
  }

	const removeCardHand = (cardToRemove: Card) => {
		setHand(prev =>
			prev.filter(card =>
				!(card.suit === cardToRemove.suit && card.rank === cardToRemove.rank)
			)
		)
	}

  const isDisabled = (opp: Card) => {
    if(!weapon)
      return true
    else if (weapon.last <= getPower(opp) && weapon.last !== 0)
      return true

    return false
  }

  return (
    <>
      <div>
        Remaining Cards: {deck.length}
      </div>
      <button onClick={() => drawCards(4)}>
        Draw 4
      </button>
      {hand && (
        <ul>
          {hand.map((card: Card) => (
            <li>
              <div onClick={() => (handleCard(card))} className='card'>
								{card.rank} of {card.suit}
								</div>
            </li>
          ))}
        </ul>
      )}
			<div>Current life: {life}</div>
			<div>Current weapon: {weapon ? (
				<div className='handWeapon'>
					<div className='weapon'>
            {weapon.strength}
          </div>
          <div className='lastEnemy'>
            {getNeatEnemy(weapon.last)}
          </div>
				</div>) : "none"}
			</div>
      <button onClick={() => handleSkip()} disabled={skipped}>
        Skip
      </button>
      {opponent && 
      <div className='decision'>
        <div className='question'>How do you want to fight?</div>
        <div>
          <button onClick={() => fight(opponent, {strength: 0, last: -1})}>
            Barehanded
          </button>
          <button onClick={() => fight(opponent, weapon!)} disabled={isDisabled(opponent)}>
            Weapon
          </button>
          <button onClick={() => setOpponent(undefined)}>
            Cancel
          </button>
        </div>
      </div>
      }
      {gameOver && (
        <div>
          Game Over:
          Your final score is: {score}
          <button onClick={handleRestart}>
            Try again?
          </button>
        </div>
      )}
    </>
  )
}

export default App
