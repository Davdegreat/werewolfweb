import * as React from 'react';

import { I18nProvider, i18n } from '../../i18n';
import { RoomListStore } from './store';
import { observer } from 'mobx-react';
import { RoomListWrapper, Wrapper, NavLinks, Navigation } from './elements';
import { NormalButton } from '../../common/button';
import { bind } from 'bind-decorator';
import { Omit } from '../../types/omit';
import { Room as RoomData, RoomListMode } from './defs';
import { Room } from './room';

export interface IPropRoomList {
  /**
   * i18next instance.
   */
  i18n: i18n;
  /**
   * store.
   */
  store: RoomListStore;
  /**
   * Flag to hide links to other types of room list.
   */
  noLinks: boolean;
  /**
   * Page move event.
   */
  onPageMove: (dist: number) => void;
}

@observer
export class RoomList extends React.Component<IPropRoomList, {}> {
  public render() {
    const { i18n, store, noLinks, onPageMove } = this.props;
    return (
      <I18nProvider i18n={i18n}>
        <RoomListInner
          i18n={i18n}
          noLinks={noLinks}
          onPageMove={onPageMove}
          rooms={store.rooms}
          mode={store.mode}
          loadingState={store.state}
          prevAvailable={store.prevAvailable}
          nextAvailable={store.nextAvailable}
        />
      </I18nProvider>
    );
  }
}

class RoomListInner extends React.Component<
  Omit<IPropRoomList, 'store'> & {
    prevAvailable: boolean;
    nextAvailable: boolean;
    mode: RoomListMode;
    rooms: RoomData[];
    noLinks: boolean;
    loadingState: RoomListStore['state'];
  },
  {}
> {
  private headerRef = React.createRef<HTMLHeadingElement>();
  public render() {
    const {
      i18n,
      noLinks,
      rooms,
      prevAvailable,
      nextAvailable,
      mode,
      loadingState,
    } = this.props;
    return (
      <Wrapper>
        <h1 ref={this.headerRef}>{i18n.t('rooms_client:title')}</h1>
        <Navigation>
          {noLinks ? null : (
            <NavLinks>
              <a href="/newroom">{i18n.t('rooms_client:link.newRoom')}</a>
              <a href="/rooms">{i18n.t('rooms_client:link.new')}</a>
              <a href="/rooms/old">{i18n.t('rooms_client:link.old')}</a>
              <a href="/rooms/log">{i18n.t('rooms_client:link.log')}</a>
            </NavLinks>
          )}
          {loadingState === 'loading' ? (
            <p>{i18n.t('rooms_client:loading')}</p>
          ) : loadingState === 'error' ? (
            <p>{i18n.t('rooms_client:loadFailed')}</p>
          ) : rooms.length === 0 ? (
            <p>{i18n.t('rooms_client:noRoom')}</p>
          ) : (
            <>
              <p>
                <NormalButton
                  disabled={!prevAvailable}
                  onClick={this.handlePrevClick}
                >
                  {i18n.t('rooms_client:prevPageButton')}
                </NormalButton>
                <NormalButton
                  disabled={!nextAvailable}
                  onClick={this.handleNextClick}
                >
                  {i18n.t('rooms_client:nextPageButton')}
                </NormalButton>
              </p>
            </>
          )}
        </Navigation>
        <RoomListWrapper>
          {rooms.map(room => (
            <Room key={room.id} room={room} listMode={mode} />
          ))}
        </RoomListWrapper>
      </Wrapper>
    );
  }
  public componentDidUpdate(prevProps: this['props']) {
    const { current } = this.headerRef;
    if (
      prevProps.loadingState == 'loading' &&
      this.props.loadingState === 'loading' &&
      current != null
    ) {
      // if header is not in the visible area, then scroll.
      const box = current.getBoundingClientRect();
      if (box.top < 0) {
        current.scrollIntoView(true);
      }
    }
  }
  @bind
  private handlePrevClick() {
    this.props.onPageMove(-1);
  }
  @bind
  private handleNextClick() {
    this.props.onPageMove(1);
  }
}
