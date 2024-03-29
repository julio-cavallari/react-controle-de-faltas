import React, {useState, useEffect} from 'react';
import {Vibration} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {NavigationActions, StackActions} from 'react-navigation';
import {
  Button,
  Paragraph,
  Dialog,
  Portal,
  Modal,
  List,
  Divider,
  TouchableRipple,
} from 'react-native-paper';

import getRealm from '../../services/realm';

import {
  Placeholder,
  PlaceholderMedia,
  PlaceholderLine,
  Shine,
} from 'rn-placeholder';

import {
  Container,
  HeaderDisciplina,
  Title,
  DeleteButton,
  Card,
  RowContainer,
  ColumnContainer,
  Name,
  NameTiny,
  ButtonsContainer,
  AddMissButton,
  DataContainer,
  GradeCard,
  FloatingButtonOpenModal,
  FloatingButtonOpenModalText,
  GradeDay,
  GradeMonth,
  GradeYear,
} from './styles';

export default function Aulas({navigation}) {
  const monthsString = [
    'Jan',
    'Fev',
    'Mar',
    'Abr',
    'Mai',
    'Jun',
    'Jul',
    'Ago',
    'Set',
    'Out',
    'Nov',
    'Dez',
  ];
  const weeksString = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const [isFocused, setIsFocused] = useState(navigation.isFocused());
  const [disciplinaData, setDisciplinaData] = useState([]);
  const [gradesData, setGradesData] = useState([]);
  const [visibleGradeDialog, setVisibleGradeDialog] = useState(false);
  const [visibleConfirmation, setVisibleConfirmation] = useState(false);
  const [idGrade, setIdGrade] = useState();
  const [nameGrade, setNameGrade] = useState('');
  const {params} = navigation.state;
  async function increaseMisses() {
    const realm = await getRealm();
    const data = realm
      .objects('Disciplina')
      .sorted('name')
      .filtered(`id == ${params.data.id}`);
    const updatedData = {
      id: params.data.id,
      miss_quantity: data[0].miss_quantity + 1,
    };
    if (data[0].miss_quantity + 1 > data[0].maximum_miss) {
      updatedData.miss_quantity = data[0].maximum_miss;
    }
    realm.write(() => {
      realm.create('Disciplina', updatedData, 'modified');
    });
    const newData = realm
      .objects('Disciplina')
      .sorted('name')
      .filtered(`id == ${params.data.id}`);
    setDisciplinaData(newData[0]);
  }

  async function decreaseMisses(t) {
    const realm = await getRealm();
    const data = realm
      .objects('Disciplina')
      .sorted('name')
      .filtered(`id == ${params.data.id}`);
    const updatedData = {
      id: params.data.id,
      miss_quantity: data[0].miss_quantity - 1,
    };
    if (data[0].miss_quantity - 1 < 0) {
      updatedData.miss_quantity = 0;
    }
    realm.write(() => {
      realm.create('Disciplina', updatedData, 'modified');
    });
    const newData = realm
      .objects('Disciplina')
      .sorted('name')
      .filtered(`id == ${params.data.id}`);
    setDisciplinaData(newData[0]);
  }

  async function deleteGrade(id) {
    const realm = await getRealm();
    const gradeData = realm.objects('Grade').filtered(`id == ${id}`);
    realm.write(() => {
      realm.delete(gradeData[0]);
    });

    const navigateToAulas = StackActions.reset({
      index: 1,
      actions: [
        NavigationActions.navigate({
          routeName: 'Disciplinas',
        }),
        NavigationActions.navigate({
          routeName: 'Details',
          params: {data: params.data},
        }),
      ],
    });
    navigation.dispatch(navigateToAulas);
  }

  useEffect(() => {
    let isSubscribed = true;
    async function getDisciplinaData() {
      const realm = await getRealm();
      const disciplinaDataMiss = realm
        .objects('Disciplina')
        .sorted('name')
        .filtered(`id == ${params.data.id}`);
      const gradeData = realm
        .objects('Grade')
        .sorted('name', true)
        .filtered(`id_disciplina == ${params.data.id}`);
      if (gradeData.length && isSubscribed) {
        setGradesData(gradeData);
      }
      if (disciplinaDataMiss.length && isSubscribed) {
        setDisciplinaData(disciplinaDataMiss[0]);
      }
    }
    getDisciplinaData();
    return () => (isSubscribed = false);
  }, [isFocused]);
  return (
    <Container>
      <Portal>
        <Dialog
          visible={visibleConfirmation}
          onDismiss={() => {
            setVisibleConfirmation(false);
          }}>
          <Dialog.Title>Excluir</Dialog.Title>
          <Dialog.Content>
            <Paragraph>
              Tem certeza que deseja excluir{' '}
              {`${nameGrade} de ${disciplinaData.name}`}?
            </Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              onPress={() => {
                setVisibleConfirmation(false);
              }}>
              Cancelar
            </Button>
            <Button
              onPress={() => {
                deleteGrade(idGrade);
                setVisibleConfirmation(false);
              }}>
              Excluir
            </Button>
          </Dialog.Actions>
        </Dialog>
        <Modal
          visible={visibleGradeDialog}
          onDismiss={() => {
            setVisibleGradeDialog(false);
          }}>
          <List.Section
            title={`${nameGrade} - ${disciplinaData.name}`}
            titleStyle={{
              fontWeight: 'bold',
              color: '#000',
              fontSize: 18,
            }}
            style={{
              marginHorizontal: 18,
              borderRadius: 2,
              backgroundColor: '#fff',
            }}>
            <Divider />
            <List.Item
              title="Excluir"
              left={props => (
                <List.Icon {...props} color={'#000'} icon="delete" />
              )}
              onPress={() => {
                setVisibleGradeDialog(false);
                setVisibleConfirmation(true);
              }}
              titleStyle={{
                color: '#000',
              }}
              style={{height: 56}}
            />
            <List.Item
              title="Editar"
              left={props => (
                <List.Icon {...props} color={'#000'} icon="edit" />
              )}
              onPress={() => {
                setVisibleGradeDialog(false);
                setVisibleConfirmation(false);
                setTimeout(() => {
                  navigation.navigate('FormGrade', {
                    update: true,
                    data: params.data,
                    grade_id: idGrade,
                  });
                }, 180);
              }}
              titleStyle={{
                color: '#000',
              }}
            />
          </List.Section>
        </Modal>
      </Portal>
      {disciplinaData.id ? (
        <>
          <HeaderDisciplina>
            <Title>{disciplinaData.name}</Title>
          </HeaderDisciplina>
          <Card
            missesLeft={
              disciplinaData.maximum_miss - disciplinaData.miss_quantity
            }>
            <RowContainer>
              <ColumnContainer>
                <Name>Faltas: {disciplinaData.miss_quantity}</Name>
                <NameTiny>
                  Faltas Restantes:{' '}
                  {disciplinaData.maximum_miss - disciplinaData.miss_quantity}
                </NameTiny>
              </ColumnContainer>
              <ButtonsContainer>
                <AddMissButton onPress={increaseMisses}>
                  <Icon name={'plus'} size={24} color="#fff" />
                </AddMissButton>
                <AddMissButton onPress={decreaseMisses}>
                  <Icon name={'minus'} size={24} color="#fff" />
                </AddMissButton>
              </ButtonsContainer>
            </RowContainer>
          </Card>
          <HeaderDisciplina>
            <Title>Provas/Trabalhos</Title>
          </HeaderDisciplina>
          {gradesData.map(grade => (
            <TouchableRipple
              underlayColor={'rgba(113, 89, 193, .16)'}
              borderless={true}
              rippleColor={'rgba(113, 89, 193, .16)'}
              onPress={() => {}}
              onLongPress={() => {
                Vibration.vibrate([1, 50, 30, 50]);
                setNameGrade(grade.name);
                setIdGrade(grade.id);
                setVisibleGradeDialog(true);
              }}>
              <GradeCard key={grade.id}>
                <RowContainer>
                  <DataContainer>
                    <GradeMonth>
                      {weeksString[new Date(grade.date).getDay()]}
                    </GradeMonth>
                    <GradeDay>{new Date(grade.date).getDate()}</GradeDay>
                    <GradeMonth>
                      {monthsString[new Date(grade.date).getMonth()]}
                    </GradeMonth>
                  </DataContainer>
                  <DataContainer flex={8}>
                    <Name>{grade.name}</Name>
                    <NameTiny>
                      Nota: {grade.grade}/{grade.maximum_grade}
                    </NameTiny>
                  </DataContainer>
                </RowContainer>
              </GradeCard>
            </TouchableRipple>
          ))}
          <FloatingButtonOpenModal
            onPress={() => {
              navigation.navigate('FormGrade', {
                data: params.data,
                update: false,
              });
            }}>
            <FloatingButtonOpenModalText>
              <Icon name={'bookmark-plus'} size={24} />
            </FloatingButtonOpenModalText>
          </FloatingButtonOpenModal>
        </>
      ) : (
        <>
          <Placeholder Animation={Shine}>
            <PlaceholderLine height={48} width={50} style={{borderRadius: 4}} />
          </Placeholder>
          <GradeCard transparent>
            <Placeholder
              Animation={Shine}
              Left={props => (
                <PlaceholderMedia
                  style={[
                    {borderRadius: 4, width: 68, height: 68},
                    props.style,
                  ]}
                />
              )}
              Right={props => (
                <PlaceholderMedia
                  style={[
                    {borderRadius: 4, width: 68, height: 68},
                    props.style,
                  ]}
                />
              )}>
              <PlaceholderLine height={68} style={{borderRadius: 4}} />
            </Placeholder>
          </GradeCard>
        </>
      )}
    </Container>
  );
}
