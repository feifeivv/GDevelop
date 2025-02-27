// @flow
import { Trans } from '@lingui/macro';
import React from 'react';
import EventsSheet, { type EventsSheetInterface } from '../../EventsSheet';
import RaisedButton from '../../UI/RaisedButton';
import PlaceholderMessage from '../../UI/PlaceholderMessage';
import {
  type RenderEditorContainerProps,
  type RenderEditorContainerPropsWithRef,
} from './BaseEditor';
import ExternalPropertiesDialog, {
  type ExternalProperties,
} from './ExternalPropertiesDialog';
import Text from '../../UI/Text';
import { Line } from '../../UI/Grid';

const styles = {
  container: {
    display: 'flex',
    flex: 1,
  },
};

type State = {|
  externalPropertiesDialogOpen: boolean,
|};

export class ExternalEventsEditorContainer extends React.Component<
  RenderEditorContainerProps,
  State
> {
  editor: ?EventsSheetInterface;

  state = {
    externalPropertiesDialogOpen: false,
  };

  shouldComponentUpdate(nextProps: RenderEditorContainerProps) {
    // Prevent any update to the editor if the editor is not active,
    // and so not visible to the user.
    return nextProps.isActive;
  }

  getProject(): ?gdProject {
    return this.props.project;
  }

  updateToolbar() {
    if (this.editor) this.editor.updateToolbar();
  }

  forceUpdateEditor() {
    // No updates to be done.
  }

  getExternalEvents(): ?gdExternalEvents {
    const { project, projectItemName } = this.props;
    if (!project || !projectItemName) return null;

    if (!project.hasExternalEventsNamed(projectItemName)) {
      return null;
    }
    return project.getExternalEvents(projectItemName);
  }

  getLayout(): ?gdLayout {
    const { project } = this.props;
    if (!project) return null;

    const layoutName = this.getAssociatedLayoutName();
    if (!layoutName) return null;

    return project.getLayout(layoutName);
  }

  getAssociatedLayoutName(): ?string {
    const { project } = this.props;
    if (!project) return null;

    const externalEvents = this.getExternalEvents();
    if (!externalEvents) return null;

    const layoutName = externalEvents.getAssociatedLayout();
    if (!project.hasLayoutNamed(layoutName)) {
      return null;
    }

    return layoutName;
  }

  saveExternalProperties = (externalProps: ExternalProperties) => {
    const externalEvents = this.getExternalEvents();
    if (!externalEvents) return;

    externalEvents.setAssociatedLayout(externalProps.layoutName);
    this.setState(
      {
        externalPropertiesDialogOpen: false,
      },
      () => this.updateToolbar()
    );
  };

  openExternalPropertiesDialog = () => {
    this.setState({
      externalPropertiesDialogOpen: true,
    });
  };

  render() {
    const { project, projectItemName } = this.props;
    const externalEvents = this.getExternalEvents();
    const layout = this.getLayout();

    if (!externalEvents || !project) {
      //TODO: Error component
      return <div>No external events called {projectItemName} found!</div>;
    }

    return (
      <div style={styles.container}>
        {layout && (
          <EventsSheet
            ref={editor => (this.editor = editor)}
            setToolbar={this.props.setToolbar}
            onOpenLayout={this.props.onOpenLayout}
            resourceSources={this.props.resourceSources}
            onChooseResource={this.props.onChooseResource}
            resourceExternalEditors={this.props.resourceExternalEditors}
            openInstructionOrExpression={this.props.openInstructionOrExpression}
            onCreateEventsFunction={this.props.onCreateEventsFunction}
            unsavedChanges={this.props.unsavedChanges}
            project={project}
            scope={{
              layout,
              externalEvents,
            }}
            globalObjectsContainer={project}
            objectsContainer={layout}
            events={externalEvents.getEvents()}
            onOpenSettings={this.openExternalPropertiesDialog}
            onOpenExternalEvents={this.props.onOpenExternalEvents}
          />
        )}
        {!layout && (
          <PlaceholderMessage>
            <Text>
              <Trans>
                To edit the external events, choose the scene in which it will
                be included:
              </Trans>
            </Text>
            <Line justifyContent="center">
              <RaisedButton
                label={<Trans>Choose the scene</Trans>}
                primary
                onClick={this.openExternalPropertiesDialog}
              />
            </Line>
          </PlaceholderMessage>
        )}
        <ExternalPropertiesDialog
          title={<Trans>Configure the external events</Trans>}
          helpTexts={[
            <Trans>
              In order to use these external events, you still need to add a
              "Link" event in the events sheet of the corresponding scene
            </Trans>,
          ]}
          open={this.state.externalPropertiesDialogOpen}
          project={project}
          onChoose={this.saveExternalProperties}
          layoutName={this.getAssociatedLayoutName()}
          onClose={() => this.setState({ externalPropertiesDialogOpen: false })}
        />
      </div>
    );
  }
}

export const renderExternalEventsEditorContainer = (
  props: RenderEditorContainerPropsWithRef
) => <ExternalEventsEditorContainer {...props} />;
